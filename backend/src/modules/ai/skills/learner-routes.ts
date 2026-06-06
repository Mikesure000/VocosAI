/**
 * Skill 学习引擎 API
 */
import type { FastifyInstance } from 'fastify';
import { authMiddleware, adminMiddleware } from '../../../middleware/auth.js';
import { skillLearner } from './skill-learner.js';
import { SKILL_REGISTRY } from './skill-registry.js';

export async function learnerRoutes(app: FastifyInstance) {
  // 记录反馈
  app.post('/ai/skills/feedback', { preHandler: [authMiddleware] }, async (req) => {
    const body = req.body as any;
    await skillLearner.recordFeedback({
      taskId: body.taskId,
      agentCode: body.agentCode,
      skillId: body.skillId,
      feedbackType: body.feedbackType,
      score: body.score,
      editDistance: body.editDistance,
      comment: body.comment,
      createdAt: new Date(),
    });
    return { message: '反馈已记录' };
  });

  // 获取Skill效果指标
  app.get('/ai/skills/:id/metrics', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const { days = '30' } = req.query as any;
    return skillLearner.getSkillMetrics(id, Number(days));
  });

  // 获取优化建议
  app.get('/ai/skills/:id/optimizations', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const skill = SKILL_REGISTRY[id];
    if (!skill) return { error: 'Skill not found' };
    return skillLearner.generateOptimizations(skill);
  });

  // 学习报告
  app.get('/ai/skills/report', { preHandler: [adminMiddleware] }, async () => {
    return skillLearner.getLearningReport();
  });

  // 获取版本历史
  app.get('/ai/skills/:id/versions', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    return skillLearner.getVersionHistory(id);
  });

  // 创建新版本
  app.post('/ai/skills/:id/versions', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    return skillLearner.createVersion(id, body.agentPrompts || {}, body.changeLog || '手动优化');
  });

  // 回滚版本
  app.post('/ai/skills/:id/rollback', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const { version } = req.body as any;
    return skillLearner.rollbackVersion(id, version);
  });

  // A/B测试
  app.post('/ai/skills/:id/ab-test', { preHandler: [adminMiddleware] }, async (req) => {
    const { id } = req.params as any;
    const body = req.body as any;
    const skill = SKILL_REGISTRY[id];
    if (!skill) return { error: 'Skill not found' };
    return skillLearner.createABTest(id, skill, { ...skill, agentPrompts: body.agentPrompts || skill.agentPrompts });
  });

  app.get('/ai/skills/:id/ab-test/:testId', { preHandler: [adminMiddleware] }, async (req) => {
    const { testId } = req.params as any;
    return skillLearner.getABTestResults(testId);
  });
}
