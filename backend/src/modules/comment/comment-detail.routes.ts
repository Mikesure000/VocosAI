/**
 * 评论详情 + 回复链 API
 */
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function commentDetailRoutes(app: FastifyInstance) {
  // 评论详情（含回复链）
  app.get('/tasks/:taskId/comments/:commentId/detail', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, commentId } = req.params as any;
    const comment = await prisma.comment.findFirst({ where: { id: commentId, taskId } });
    if (!comment) return null;

    // 查找该评论的回复
    const replies = await prisma.comment.findMany({
      where: { taskId, parentCommentId: comment.commentIdExternal },
      orderBy: { likeCount: 'desc' },
      take: 50,
    });

    // 查找引用该评论的回复
    const quotedBy = await prisma.comment.findMany({
      where: { taskId, quotedCommentId: comment.commentIdExternal },
      orderBy: { likeCount: 'desc' },
      take: 50,
    });

    return {
      ...comment,
      signalLabels: comment.signalLabels ? JSON.parse(comment.signalLabels) : [],
      replies: replies.map((r) => ({
        ...r,
        signalLabels: r.signalLabels ? JSON.parse(r.signalLabels) : [],
      })),
      quotedBy: quotedBy.map((r) => ({
        ...r,
        signalLabels: r.signalLabels ? JSON.parse(r.signalLabels) : [],
      })),
    };
  });

  // 回复链重建（按一级评论聚合）
  app.get('/tasks/:taskId/threads', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const { page = '1', pageSize = '20' } = req.query as any;

    const topLevel = await prisma.comment.findMany({
      where: { taskId, isReply: false, replyCount: { gt: 0 } },
      orderBy: { replyCount: 'desc' },
      take: Number(pageSize),
      skip: (Number(page) - 1) * Number(pageSize),
      select: { id: true, commentIdExternal: true, commentText: true, likeCount: true, replyCount: true },
    });

    const total = await prisma.comment.count({ where: { taskId, isReply: false, replyCount: { gt: 0 } } });

    // 每个一级评论拉取前3条回复
    const threads = await Promise.all(
      topLevel.map(async (root) => {
        const replies = await prisma.comment.findMany({
          where: { taskId, parentCommentId: root.commentIdExternal },
          orderBy: { likeCount: 'desc' },
          take: 5,
          select: { id: true, commentText: true, likeCount: true, userNameHash: true, createdAtExternal: true },
        });
        return { ...root, replies };
      })
    );

    return { threads, total, page: Number(page), pageSize: Number(pageSize) };
  });
}
