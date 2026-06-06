import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.js';

// AI module routes - will be expanded with real AI agent integration
export async function aiRoutes(app: FastifyInstance) {
  // Get agent list
  app.get('/ai/agents', { preHandler: [authMiddleware] }, async () => {
    return {
      agents: [
        { code: 'agent-00', name: '任务理解与目标识别', version: '1.0.0' },
        { code: 'agent-01', name: '原内容拆解', version: '1.0.0' },
        { code: 'agent-02', name: '评论去重清洗', version: '1.0.0' },
        { code: 'agent-03', name: '水军与无效评论过滤', version: '1.0.0' },
        { code: 'agent-04', name: '多轮对话清洗', version: '1.0.0' },
        { code: 'agent-05', name: '情感深度分析', version: '1.0.0' },
        { code: 'agent-06', name: '高价值评论筛选', version: '1.0.0' },
        { code: 'agent-07', name: '用户需求与购买障碍识别', version: '1.0.0' },
        { code: 'agent-08', name: '内容-评论归因', version: '1.0.0' },
        { code: 'agent-09', name: '内容价值类型识别', version: '1.0.0' },
        { code: 'agent-10', name: '平台策略生成', version: '1.0.0' },
        { code: 'agent-11', name: '内容生产卡生成', version: '1.0.0' },
        { code: 'agent-12', name: '评论区运营', version: '1.0.0' },
        { code: 'agent-13', name: '投流适配评分', version: '1.0.0' },
        { code: 'agent-14', name: '发布前质检', version: '1.0.0' },
        { code: 'agent-15', name: '报告组装', version: '1.0.0' },
        { code: 'agent-16', name: 'AI 质量评估', version: '1.0.0' },
      ],
    };
  });

  // Model gateway status
  app.get('/ai/model-gateway/status', { preHandler: [authMiddleware] }, async () => {
    return {
      status: 'online',
      mode: process.env.VOCOS_MODEL_MODE || 'mock',
      primaryProvider: process.env.VOCOS_PRIMARY_PROVIDER || 'deepseek',
    };
  });
}
