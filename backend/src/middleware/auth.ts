import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}

export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  await authMiddleware(request, reply);
  const user = request.user as any;
  if (user?.role !== 'super_admin' && user?.role !== 'team_admin') {
    reply.status(403).send({ message: 'Forbidden: admin access required' });
  }
}
