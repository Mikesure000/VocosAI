/**
 * SSE 进度推送路由
 * 客户端通过 EventSource 订阅任务进度
 */
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function sseRoutes(app: FastifyInstance) {
  // SSE 进度订阅
  app.get('/tasks/:taskId/progress-stream', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { taskId } = req.params as any;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const sendProgress = async () => {
      const task = await prisma.analysisTask.findUnique({
        where: { id: taskId },
        select: { status: true, progress: true },
      });
      if (!task) {
        reply.raw.write(`data: ${JSON.stringify({ status: 'not_found' })}\n\n`);
        reply.raw.end();
        return;
      }
      const progress = task.progress ? JSON.parse(task.progress) : { currentStep: 0, totalSteps: 17, steps: [] };
      reply.raw.write(`data: ${JSON.stringify({ status: task.status, ...progress })}\n\n`);
      return task.status;
    };

    // 立即发送一次
    let status = await sendProgress();

    // 每2秒轮询直到完成/失败
    const interval = setInterval(async () => {
      try {
        status = await sendProgress();
        if (status === 'completed' || status === 'failed' || status === 'partially_failed') {
          clearInterval(interval);
          reply.raw.end();
        }
      } catch {
        clearInterval(interval);
        reply.raw.end();
      }
    }, 2000);

    req.raw.on('close', () => {
      clearInterval(interval);
    });
  });

  // 通知列表
  app.get('/notifications', { preHandler: [authMiddleware] }, async (req) => {
    const { limit = '20' } = req.query as any;
    const tasks = await prisma.analysisTask.findMany({
      where: { OR: [{ status: 'completed' }, { status: 'failed' }, { status: 'analyzing' }] },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: { id: true, taskName: true, status: true, projectId: true, completedAt: true },
    });

    return tasks.map((t) => ({
      id: t.id,
      type: t.status === 'completed' ? 'success' : t.status === 'failed' ? 'error' : 'info',
      title: t.taskName,
      message: t.status === 'completed' ? '分析完成' : t.status === 'failed' ? '分析失败' : '分析中...',
      time: t.completedAt ? t.completedAt.toISOString() : new Date().toISOString(),
      link: `/projects/${t.projectId}/tasks/${t.id}/insights`,
    }));
  });
}
