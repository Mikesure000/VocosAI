/**
 * AI 设置 API — API Key 管理 + 模型测试
 */
import type { FastifyInstance } from 'fastify';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
import { prisma } from '../../config/prisma.js';
import { modelGateway } from '../ai/gateway/model-gateway.js';

export async function aiSettingsRoutes(app: FastifyInstance) {
  // 获取 AI 设置状态
  app.get('/ai/settings', { preHandler: [authMiddleware] }, async () => {
    const providers = await prisma.modelProvider.findMany({
      select: { id: true, providerName: true, baseUrl: true, status: true },
    });
    return {
      mode: process.env.VOCOS_MODEL_MODE || 'mock',
      primaryProvider: process.env.VOCOS_PRIMARY_PROVIDER || 'deepseek',
      providers: providers.map((p) => ({
        ...p,
        hasKey: !!(process.env[`${p.providerName.toUpperCase()}_API_KEY`]),
      })),
    };
  });

  // 保存 API Key（加密存储）
  app.post('/ai/settings/key', { preHandler: [adminMiddleware] }, async (req) => {
    const { provider, apiKey } = req.body as any;
    const crypto = await import('node:crypto');

    const secret = process.env.VOCOS_KEY_ENCRYPTION_SECRET || 'dev-secret';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    const encryptedKey = iv.toString('hex') + ':' + authTag + ':' + encrypted;

    // 设置环境变量
    const envKey = `${provider.toUpperCase()}_API_KEY`;
    process.env[envKey] = apiKey;

    // 更新数据库
    const existing = await prisma.modelProvider.findFirst({
      where: { providerName: provider },
    });
    if (existing) {
      await prisma.modelProvider.update({
        where: { id: existing.id },
        data: { apiKeyEncrypted: encryptedKey },
      });
    }

    return { message: `${provider} API Key 已保存` };
  });

  // 测试模型连接
  app.post('/ai/settings/test', { preHandler: [adminMiddleware] }, async (req) => {
    const { provider, model } = req.body as any;

    try {
      const result = await modelGateway.call({
        agentCode: 'agent-00',
        systemPrompt: '你是一个测试助手。',
        userPrompt: '请回复"连接成功"',
        temperature: 0.1,
        maxTokens: 50,
      });

      return {
        success: result.success,
        modelName: result.modelName,
        providerName: result.providerName,
        latencyMs: result.latencyMs,
        content: result.content?.slice(0, 200),
        error: result.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 切换 AI 模式 (mock/live)
  app.post('/ai/settings/mode', { preHandler: [adminMiddleware] }, async (req) => {
    const { mode } = req.body as any;
    if (!['mock', 'live'].includes(mode)) {
      return { error: '模式只能是 mock 或 live' };
    }
    process.env.VOCOS_MODEL_MODE = mode;
    return { message: `AI 模式已切换为 ${mode}` };
  });
}
