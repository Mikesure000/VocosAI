import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import { badRequest, unauthorized } from '../../shared/errors.js';

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post('/register', async (req, reply) => {
    const { name, email, password } = req.body as any;
    if (!email || !password || !name) {
      return reply.status(400).send({ message: '姓名、邮箱和密码为必填项' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(400).send({ message: '该邮箱已被注册' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return { id: user.id, message: '注册成功' };
  });

  // Login
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as any;
    if (!email || !password) {
      return reply.status(400).send({ message: '邮箱和密码为必填项' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(400).send({ message: '邮箱或密码错误' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(400).send({ message: '邮箱或密码错误' });
    }

    if (user.status === 'disabled') {
      return reply.status(403).send({ message: '账号已被禁用' });
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    }, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  });

  // Get current user
  app.get('/me', { preHandler: [authMiddleware] }, async (req) => {
    const { id } = req.user as any;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true, status: true, createdAt: true },
    });
    return user;
  });
}
