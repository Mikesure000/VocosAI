import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { costGovernance } from '../ai/governance/cost-governance.js';
import { qualityGovernance } from '../ai/governance/quality-governance.js';
import { auditService } from './audit.service.js';

export async function adminRoutes(app: FastifyInstance) {
  // Dashboard stats
  app.get('/stats', { preHandler: [adminMiddleware] }, async () => {
    const [users, teams, projects, tasks, reports] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.project.count(),
      prisma.analysisTask.count(),
      prisma.report.count(),
    ]);
    return { users, teams, projects, tasks, reports };
  });

  // === Users ===
  app.get('/users', { preHandler: [adminMiddleware] }, async () => {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.put('/users/:id', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    return prisma.user.update({
      where: { id },
      data: {
        role: body.role,
        status: body.status,
      },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
  });

  // === Teams ===
  app.get('/teams', { preHandler: [adminMiddleware] }, async () => {
    return prisma.team.findMany({
      include: { _count: { select: { members: true, projects: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  // === Projects ===
  app.get('/projects', { preHandler: [adminMiddleware] }, async () => {
    return prisma.project.findMany({
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  // === Tasks ===
  app.get('/tasks', { preHandler: [adminMiddleware] }, async () => {
    const { status, limit = '50', offset = '0' } = req.query as any;
    const where: any = {};
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      prisma.analysisTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.analysisTask.count({ where }),
    ]);

    return { tasks, total };
  });

  // === AI Runs ===
  app.get('/ai/runs', { preHandler: [adminMiddleware] }, async (req) => {
    const { limit = '50', offset = '0', status, agentName } = req.query as any;
    const where: any = {};
    if (status) where.status = status;
    if (agentName) where.agentName = agentName;

    const [runs, total] = await Promise.all([
      prisma.aiRun.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.aiRun.count({ where }),
    ]);

    return { runs, total };
  });

  // === Cost Summary ===
  app.get('/ai/cost-summary', { preHandler: [adminMiddleware] }, async () => {
    const summary = await costGovernance.getCostSummary();
    return summary;
  });

  // === Cost Details ===
  app.get('/ai/cost-details', { preHandler: [adminMiddleware] }, async (req) => {
    const { teamId, days = '30' } = req.query as any;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const where: any = { usageDate: { gte: since } };
    if (teamId) where.teamId = teamId;

    return prisma.costUsage.findMany({
      where,
      orderBy: { usageDate: 'desc' },
      take: 200,
    });
  });

  // === Quality Summary ===
  app.get('/ai/quality-summary', { preHandler: [adminMiddleware] }, async (req) => {
    const { teamId } = req.query as any;
    return qualityGovernance.getQualitySummary(teamId as string);
  });

  // === Quality Feedback ===
  app.get('/ai/quality-feedback', { preHandler: [adminMiddleware] }, async (req) => {
    const { limit = '50', offset = '0' } = req.query as any;
    return prisma.aiQualityFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });
  });

  // Record feedback
  app.post('/ai/quality-feedback', { preHandler: [adminMiddleware] }, async (req) => {
    const user = req.user as any;
    const body = req.body as any;
    return qualityGovernance.recordFeedback({ ...body, createdBy: user.id });
  });

  // === Audit Logs ===
  app.get('/audit-logs', { preHandler: [adminMiddleware] }, async (req) => {
    const { limit = '50', offset = '0', userId, action, resourceType } = req.query as any;
    return auditService.list({
      userId: userId as string,
      action: action as string,
      resourceType: resourceType as string,
      limit: Number(limit),
      offset: Number(offset),
    });
  });

  // === AI Agents ===
  app.get('/ai/agents', { preHandler: [adminMiddleware] }, async () => {
    return prisma.aiAgent.findMany({ orderBy: { executionOrder: 'asc' } });
  });

  // === Model Providers ===
  app.get('/ai/providers', { preHandler: [adminMiddleware] }, async () => {
    return prisma.modelProvider.findMany();
  });

  // === Model Configs ===
  app.get('/ai/model-configs', { preHandler: [adminMiddleware] }, async () => {
    return prisma.modelConfig.findMany({ include: { provider: true } });
  });

  // === Routing Rules ===
  app.get('/ai/routing-rules', { preHandler: [adminMiddleware] }, async () => {
    return prisma.modelRoutingRule.findMany({
      include: { primaryModel: true, fallbackModel: true },
    });
  });

  // === System Config ===
  app.get('/system-config', { preHandler: [adminMiddleware] }, async () => {
    return {
      modelMode: process.env.VOCOS_MODEL_MODE || 'mock',
      primaryProvider: process.env.VOCOS_PRIMARY_PROVIDER || 'deepseek',
      monthlyQuota: parseInt(process.env.VOCOS_MONTHLY_QUOTA || '1000000'),
      taskCostLimit: parseFloat(process.env.VOCOS_TASK_COST_LIMIT || '12.00'),
    };
  });
}
