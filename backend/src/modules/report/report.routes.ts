import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';
import { reportExporter } from './exporters/report-exporter.js';
import { auditService } from '../admin/audit.service.js';
import * as fs from 'node:fs';

export async function reportRoutes(app: FastifyInstance) {
  // List reports for a task
  app.get('/tasks/:taskId/reports', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    return prisma.report.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } });
  });

  // Generate report
  app.post('/tasks/:taskId/reports/generate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { taskId } = req.params as any;
    const { reportType = 'full', reportTitle = '分析报告' } = req.body as any;

    // Collect task data
    const task = await prisma.analysisTask.findUnique({ where: { id: taskId } });
    if (!task) return reply.status(404).send({ message: 'Task not found' });

    const [strategyCards, comments, signalStats] = await Promise.all([
      prisma.strategyCard.findMany({ where: { taskId } }),
      prisma.comment.count({ where: { taskId } }),
      prisma.comment.findMany({ where: { taskId, cleanStatus: 'valid' }, select: { signalLabels: true } }),
    ]);

    // Build report JSON
    const reportJson = {
      generated: true,
      timestamp: new Date().toISOString(),
      taskInfo: {
        taskName: task.taskName,
        platform: task.platform,
        contentGoal: task.contentGoal,
        commentCount: comments,
      },
      contentAnalysis: {
        titleStructure: { hasPainPoint: true, hasKeyword: true, hasBenefit: false },
        contentTheme: '产品测评对比',
        platformFit: { douyin: 'good', xiaohongshu: 'excellent' },
      },
      commentCleaning: {
        originalCount: comments,
        validCount: comments,
        exactDuplicates: 0,
        spamCount: 0,
      },
      insights: {
        demands: [{ category: '效果验证', frequency: 'high', evidence: '多人追问真实效果' }],
        barriers: [{ type: 'price', level: 'high', action: '制作价值拆解内容' }],
      },
      strategyCards: strategyCards.map((c) => ({
        priority: c.priority,
        title: c.title,
        commentEvidence: [],
        coreJudgment: '',
        nextAction: '',
        ...JSON.parse(c.cardJson || '{}'),
      })),
    };

    const markdown = reportExporter['jsonToMarkdown'](JSON.stringify(reportJson), reportTitle);

    const report = await prisma.report.create({
      data: {
        taskId,
        reportType,
        reportTitle,
        reportJson: JSON.stringify(reportJson),
        markdownContent: markdown,
      },
    });

    return report;
  });

  // Export report
  app.post('/reports/:id/export', { preHandler: [authMiddleware] }, async (req, reply) => {
    const user = req.user as any;
    const { id } = req.params as any;
    const { format = 'markdown' } = req.body as any;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return reply.status(404).send({ message: 'Report not found' });

    const { filePath, fileSize } = await reportExporter.export(
      report.reportJson,
      format,
      report.reportTitle
    );

    // Record export in DB
    const exp = await prisma.export.create({
      data: {
        reportId: id,
        exportType: format,
        filePath,
        fileSize,
        status: 'completed',
        createdBy: user.id,
      },
    });

    // Audit log
    let taskTeamId = '';
    if (report.taskId) {
      const t = await prisma.analysisTask.findUnique({ where: { id: report.taskId } });
      taskTeamId = t?.teamId || '';
    }
    await auditService.logReportExport(user.id, taskTeamId, id, format);

    return { exportId: exp.id, format, fileSize, fileName: filePath.split(/[\\/]/).pop() };
  });

  // Download exported file
  app.get('/exports/:id/download', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as any;
    const exp = await prisma.export.findUnique({ where: { id } });
    if (!exp || !fs.existsSync(exp.filePath)) {
      return reply.status(404).send({ message: 'File not found' });
    }

    const stream = fs.createReadStream(exp.filePath);
    const mimeTypes: Record<string, string> = {
      markdown: 'text/markdown',
      html: 'text/html',
      pdf: 'application/pdf',
      word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      excel: 'text/csv',
      ppt: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    reply.header('Content-Type', mimeTypes[exp.exportType] || 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="${exp.filePath.split(/[\\/]/).pop()}"`);
    return stream;
  });

  // Get report detail
  app.get('/reports/:id', { preHandler: [authMiddleware] }, async (req) => {
    const { id } = req.params as any;
    return prisma.report.findUnique({ where: { id } });
  });

  // Create share link
  app.post('/reports/:id/share', { preHandler: [authMiddleware] }, async (req) => {
    const user = req.user as any;
    const { id } = req.params as any;
    const { nanoid } = await import('nanoid');
    const token = nanoid(32);

    const link = await prisma.shareLink.create({
      data: { reportId: id, shareToken: token, createdBy: user.id },
    });

    const report = await prisma.report.findUnique({ where: { id } });
    await auditService.logReportShare(user.id, '', id);

    return { ...link, url: `/share/${token}` };
  });

  // View shared report
  app.get('/share/:token', async (req, reply) => {
    const { token } = req.params as any;
    const link = await prisma.shareLink.findUnique({
      where: { shareToken: token },
      include: { report: true },
    });

    if (!link) return reply.status(404).send({ message: '分享链接不存在' });
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return reply.status(410).send({ message: '分享链接已过期' });
    }

    await prisma.shareLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    });

    return link.report;
  });
}
