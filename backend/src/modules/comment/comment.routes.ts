import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import { detectSignals, getSignalInfo, getAllSignals } from './comment-signals.js';

export async function commentRoutes(app: FastifyInstance) {
  // List comments for a task (paginated, filtered)
  app.get('/tasks/:taskId/comments', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const { page = '1', pageSize = '50', cleanStatus, valueScore, signal } = req.query as any;

    const where: any = { taskId };
    if (cleanStatus) where.cleanStatus = cleanStatus;
    if (valueScore) where.valueScore = { gte: Number(valueScore) };
    if (signal) where.signalLabels = { contains: signal };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { valueScore: 'desc' },
        take: Number(pageSize),
        skip: (Number(page) - 1) * Number(pageSize),
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total, page: Number(page), pageSize: Number(pageSize) };
  });

  // Get comment detail
  app.get('/tasks/:taskId/comments/:commentId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, commentId } = req.params as any;
    return prisma.comment.findFirst({ where: { id: commentId, taskId } });
  });

  // Update comment classification (manual correction)
  app.put('/tasks/:taskId/comments/:commentId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, commentId } = req.params as any;
    const body = req.body as any;

    const update: any = {};
    if (body.cleanStatus) update.cleanStatus = body.cleanStatus;
    if (body.valueScore !== undefined) update.valueScore = body.valueScore;
    if (body.signalLabels) update.signalLabels = JSON.stringify(body.signalLabels);

    return prisma.comment.updateMany({
      where: { id: commentId, taskId },
      data: update,
    });
  });

  // Batch re-detect signals for all comments in task
  app.post('/tasks/:taskId/comments/re-detect-signals', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      select: { id: true, commentText: true },
    });

    let updated = 0;
    for (const c of comments) {
      const signals = detectSignals(c.commentText);
      if (signals.length > 0) {
        await prisma.comment.update({
          where: { id: c.id },
          data: {
            signalLabels: JSON.stringify(signals),
            valueScore: Math.min(signals.length + 1, 5),
          },
        });
        updated++;
      }
    }

    return { totalComments: comments.length, updatedWithSignals: updated };
  });

  // Signal statistics for a task
  app.get('/tasks/:taskId/signal-stats', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const comments = await prisma.comment.findMany({
      where: { taskId, cleanStatus: 'valid' },
      select: { signalLabels: true, valueScore: true, sentimentLabel: true },
    });

    const signalCounts: Record<string, { count: number; label: string; category: string }> = {};
    let totalWithSignals = 0;
    const valueDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    comments.forEach((c) => {
      if (c.valueScore) valueDistribution[String(c.valueScore)] = (valueDistribution[String(c.valueScore)] || 0) + 1;
      if (c.signalLabels) {
        try {
          const labels = JSON.parse(c.signalLabels);
          if (labels.length > 0) totalWithSignals++;
          labels.forEach((l: string) => {
            const info = getSignalInfo(l);
            if (!signalCounts[l]) {
              signalCounts[l] = { count: 0, label: info?.label || l, category: info?.category || 'unknown' };
            }
            signalCounts[l].count++;
          });
        } catch {}
      }
    });

    return {
      totalComments: comments.length,
      totalWithSignals,
      signalCounts: Object.entries(signalCounts)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => b.count - a.count),
      valueDistribution,
    };
  });
}
