import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function fileRoutes(app: FastifyInstance) {
  // 任务文件列表
  app.get('/tasks/:taskId/files', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    return prisma.commentFile.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } });
  });

  // 删除文件
  app.delete('/tasks/:taskId/files/:fileId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, fileId } = req.params as any;
    const file = await prisma.commentFile.findFirst({ where: { id: fileId, taskId } });
    if (file && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }
    await prisma.commentFile.deleteMany({ where: { id: fileId, taskId } });
    return { message: '文件已删除' };
  });

  // 导出文件列表
  app.get('/exports', { preHandler: [authMiddleware] }, async (req) => {
    const exports = await prisma.export.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { report: { select: { reportTitle: true } } },
    });
    return exports.map((e) => ({
      ...e,
      fileName: e.filePath.split(/[\\/]/).pop(),
      exists: fs.existsSync(e.filePath),
    }));
  });

  // 删除导出文件
  app.delete('/exports/:id', { preHandler: [authMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const exp = await prisma.export.findUnique({ where: { id } });
    if (exp && fs.existsSync(exp.filePath)) {
      fs.unlinkSync(exp.filePath);
    }
    await prisma.export.deleteMany({ where: { id } });
    return { message: '导出文件已删除' };
  });
}
