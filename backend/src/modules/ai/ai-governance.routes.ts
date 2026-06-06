/**
 * AI 治理 API — Prompt/Schema/Agent 管理
 */
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { adminMiddleware } from '../../middleware/auth.js';

export async function aiGovernanceRoutes(app: FastifyInstance) {
  // ============ Prompts ============
  app.get('/ai/prompts', { preHandler: [adminMiddleware] }, async () => {
    return prisma.aiPrompt.findMany({
      include: { agent: { select: { agentName: true, agentCode: true } }, versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.get('/ai/prompts/:id', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    return prisma.aiPrompt.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' } } },
    });
  });

  app.post('/ai/prompts', { preHandler: [adminMiddleware] }, async (req) => {
    const body = req.body as any;
    return prisma.aiPrompt.create({
      data: {
        agentId: body.agentId,
        promptName: body.promptName,
        versions: {
          create: {
            version: '1.0.0',
            systemPrompt: body.systemPrompt || '',
            userPromptTemplate: body.userPromptTemplate || '',
            inputVariables: JSON.stringify(body.inputVariables || []),
            status: 'draft',
            createdBy: 'admin',
          },
        },
      },
      include: { versions: true },
    });
  });

  app.put('/ai/prompts/:id', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    if (body.systemPrompt || body.userPromptTemplate) {
      await prisma.aiPromptVersion.create({
        data: {
          promptId: id,
          version: body.version || '1.1.0',
          systemPrompt: body.systemPrompt || '',
          userPromptTemplate: body.userPromptTemplate || '',
          inputVariables: JSON.stringify(body.inputVariables || []),
          status: body.status || 'draft',
          createdBy: 'admin',
          changeLog: body.changeLog,
        },
      });
    }
    return prisma.aiPrompt.findUnique({ where: { id }, include: { versions: { orderBy: { createdAt: 'desc' } } } });
  });

  // ============ Schemas ============
  app.get('/ai/schemas', { preHandler: [adminMiddleware] }, async () => {
    return prisma.aiSchema.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.post('/ai/schemas', { preHandler: [adminMiddleware] }, async (req) => {
    const body = req.body as any;
    return prisma.aiSchema.create({
      data: {
        schemaName: body.schemaName,
        schemaVersion: body.schemaVersion || '1.0.0',
        schemaJson: JSON.stringify(body.schemaJson || {}),
      },
    });
  });

  app.put('/ai/schemas/:id', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    return prisma.aiSchema.update({
      where: { id },
      data: { schemaName: body.schemaName, schemaVersion: body.schemaVersion, schemaJson: JSON.stringify(body.schemaJson || {}) },
    });
  });

  // ============ Agents ============
  app.get('/ai/agents/detail', { preHandler: [adminMiddleware] }, async () => {
    const agents = await prisma.aiAgent.findMany({
      orderBy: { executionOrder: 'asc' },
      include: { aiPrompts: { select: { id: true, promptName: true, status: true } } },
    });
    return agents;
  });

  app.put('/ai/agents/:id/toggle', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const agent = await prisma.aiAgent.findUnique({ where: { id } });
    if (!agent) return { error: 'Agent not found' };
    return prisma.aiAgent.update({
      where: { id },
      data: { status: agent.status === 'active' ? 'inactive' : 'active' },
    });
  });

  app.put('/ai/agents/:id', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    return prisma.aiAgent.update({
      where: { id },
      data: { status: body.status, agentVersion: body.agentVersion, description: body.description },
    });
  });
}
