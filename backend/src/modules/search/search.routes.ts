import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function searchRoutes(app: FastifyInstance) {
  app.get('/search', { preHandler: [authMiddleware] }, async (req) => {
    const { q, limit = '20' } = req.query as any;
    if (!q || q.length < 1) return { results: [], total: 0 };

    const searchTerm = q.trim();
    const take = Math.min(Number(limit), 50);

    const projects = await prisma.project.findMany({
      where: { projectName: { contains: searchTerm } },
      take,
      select: { id: true, projectName: true, brandName: true },
    });

    const tasks = await prisma.analysisTask.findMany({
      where: { taskName: { contains: searchTerm } },
      take,
      select: { id: true, taskName: true, projectId: true, platform: true, status: true },
    });

    const comments = await prisma.comment.findMany({
      where: { commentText: { contains: searchTerm } },
      take,
      select: { id: true, taskId: true, commentText: true, valueScore: true },
    });

    const results = [
      ...projects.map((p) => ({ type: 'project' as const, id: p.id, title: p.projectName, subtitle: p.brandName || '', link: `/projects/${p.id}` })),
      ...tasks.map((t) => ({ type: 'task' as const, id: t.id, title: t.taskName, subtitle: t.platform === 'douyin' ? '抖音' : '小红书', link: `/projects/${t.projectId}/tasks/${t.id}/insights` })),
      ...comments.map((c) => ({ type: 'comment' as const, id: c.id, title: c.commentText.slice(0, 60), subtitle: `${c.valueScore}分`, link: `/projects//tasks/${c.taskId}/high-value` })),
    ].slice(0, take);

    return { results, total: results.length };
  });
}
