import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../middleware/auth.js';
import { SKILL_REGISTRY, autoSelectSkills } from './skill-registry.js';

export async function skillRoutes(app: FastifyInstance) {
  // 获取所有Skill定义
  app.get('/ai/skills', { preHandler: [authMiddleware] }, async () => {
    return Object.values(SKILL_REGISTRY).map((s) => ({
      id: s.id,
      type: s.type,
      name: s.name,
      description: s.description,
      agentCount: Object.keys(s.agentPrompts).length,
    }));
  });

  // 获取单个Skill详情
  app.get('/ai/skills/:id', { preHandler: [authMiddleware] }, async (req) => {
    const { id } = req.params as any;
    return SKILL_REGISTRY[id] || null;
  });

  // 预览：给定任务参数，展示将选择哪些Skills和增强后的Prompt
  app.post('/ai/skills/preview', { preHandler: [authMiddleware] }, async (req) => {
    const body = req.body as any;
    const skills = autoSelectSkills({
      platform: body.platform || 'douyin',
      industry: body.industry,
      contentGoal: body.contentGoal,
      outputOptions: body.outputOptions,
    });

    return {
      selectedSkills: skills.map((s) => ({ id: s.id, name: s.name, type: s.type })),
      agentPreview: {
        'agent-01': skills.length > 0
          ? `将注入 ${skills.length} 个Skill增强：${skills.map((s) => s.name).join('、')}`
          : '无Skill增强（使用基础Prompt）',
      },
    };
  });
}
