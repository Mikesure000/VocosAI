import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function strategyRoutes(app: FastifyInstance) {
  // Get strategy cards for a task
  app.get('/tasks/:taskId/strategy-cards', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    return prisma.strategyCard.findMany({
      where: { taskId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  });

  // Create a strategy card
  app.post('/tasks/:taskId/strategy-cards', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const body = req.body as any;

    return prisma.strategyCard.create({
      data: {
        taskId,
        priority: body.priority || 'P1',
        title: body.title,
        platform: body.platform,
        cardJson: body.cardJson || JSON.stringify(body),
        status: 'pending',
      },
    });
  });

  // Update strategy card (adopt/edit/reject)
  app.put('/tasks/:taskId/strategy-cards/:cardId', { preHandler: [authMiddleware] }, async (req) => {
    const user = req.user as any;
    const { taskId, cardId } = req.params as any;
    const body = req.body as any;

    const update: any = {};
    if (body.status) update.status = body.status;
    if (body.title) update.title = body.title;
    if (body.priority) update.priority = body.priority;
    if (body.cardJson) update.cardJson = body.cardJson;
    if (body.status === 'adopted') {
      update.adoptedBy = user.id;
      update.adoptedAt = new Date();
    }

    return prisma.strategyCard.updateMany({
      where: { id: cardId, taskId },
      data: update,
    });
  });

  // Delete strategy card
  app.delete('/tasks/:taskId/strategy-cards/:cardId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, cardId } = req.params as any;
    await prisma.strategyCard.deleteMany({ where: { id: cardId, taskId } });
    return { message: '策略卡已删除' };
  });

  // Get production cards for a task
  app.get('/tasks/:taskId/production-cards', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const { platform } = req.query as any;
    const where: any = { taskId };
    if (platform) where.platform = platform;

    return prisma.productionCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  });

  // Create production card
  app.post('/tasks/:taskId/production-cards', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const body = req.body as any;

    return prisma.productionCard.create({
      data: {
        taskId,
        strategyCardId: body.strategyCardId,
        platform: body.platform,
        cardJson: body.cardJson || JSON.stringify(body),
        status: 'pending',
      },
    });
  });

  // Update production card
  app.put('/tasks/:taskId/production-cards/:cardId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, cardId } = req.params as any;
    const body = req.body as any;

    const update: any = {};
    if (body.status) update.status = body.status;
    if (body.cardJson) update.cardJson = body.cardJson;
    if (body.status === 'adopted') update.adoptedAt = new Date();
    if (body.cardJson) update.editCount = { increment: 1 };

    return prisma.productionCard.updateMany({
      where: { id: cardId, taskId },
      data: update,
    });
  });

  // Delete production card
  app.delete('/tasks/:taskId/production-cards/:cardId', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId, cardId } = req.params as any;
    await prisma.productionCard.deleteMany({ where: { id: cardId, taskId } });
    return { message: '生产卡已删除' };
  });

  // Generate AI strategy cards (mock)
  app.post('/tasks/:taskId/strategy-cards/generate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { taskId } = req.params as any;

    // Mock strategy card generation
    const mockCards = [
      {
        taskId,
        priority: 'P0',
        title: '制作"贵在哪里"价值拆解视频',
        platform: 'both',
        cardJson: JSON.stringify({
          contentOpportunity: '价格异议评论占高价值评论的31%，用户不是嫌贵是不理解价值来源',
          commentEvidence: ['这个和几十块的有什么区别？', '贵在哪里？', '是不是智商税？'],
          userPainPoint: '价格敏感但品质有追求',
          userBarrier: '价值认知不足',
          coreJudgment: '需要一条价值拆解内容建立价格锚点',
          suggestedPlatform: 'douyin',
          contentFormat: '口播+对比展示',
          suggestedGoal: '转化成交',
          estimatedValue: '预计可降低价格异议评论40%',
          riskWarning: '避免贬低竞品，聚焦自身价值差异',
          nextAction: '制作对比素材并拍摄',
        }),
        status: 'pending',
      },
      {
        taskId,
        priority: 'P1',
        title: '分肤质使用教程（油皮/干皮）',
        platform: 'xiaohongshu',
        cardJson: JSON.stringify({
          contentOpportunity: '使用疑问类评论高频出现，用户需要针对性指导',
          commentEvidence: ['适合油皮吗？', '干皮能用吗？', '怎么用效果最好？'],
          userPainPoint: '不确定产品是否适合自己肤质',
          userBarrier: '缺乏场景化使用指导',
          coreJudgment: '分肤质教程可覆盖最大的信息缺口',
          suggestedPlatform: 'xiaohongshu',
          contentFormat: '图文教程',
          suggestedGoal: '种草收藏',
          estimatedValue: '预计可提升收藏率25%',
          riskWarning: '需确保内容专业准确',
          nextAction: '拍摄分肤质使用步骤图',
        }),
        status: 'pending',
      },
      {
        taskId,
        priority: 'P2',
        title: '成分科普：核心成分功效解析',
        platform: 'xiaohongshu',
        cardJson: JSON.stringify({
          contentOpportunity: '成分关注类评论有增长趋势',
          commentEvidence: ['成分安全吗？', '含酒精吗？', 'XX成分有什么作用？'],
          userPainPoint: '对成分功效不了解',
          userBarrier: '信息不对称导致的信任缺口',
          coreJudgment: '成分科普可建立专业信任',
          suggestedPlatform: 'xiaohongshu',
          contentFormat: '图文清单',
          suggestedGoal: '品牌心智',
          estimatedValue: '中长期品牌资产建设',
          riskWarning: '避免过度承诺功效',
          nextAction: '收集成分文献资料',
        }),
        status: 'pending',
      },
    ];

    const created = [];
    for (const card of mockCards) {
      const c = await prisma.strategyCard.create({ data: card });
      created.push(c);
    }

    return { message: '策略卡生成完成', count: created.length, cards: created };
  });

  // Generate AI production cards (mock)
  app.post('/tasks/:taskId/production-cards/generate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { taskId } = req.params as any;
    const { platform } = req.body as any;

    const cardJson = platform === 'douyin'
      ? JSON.stringify({
          contentGoal: '解决价格异议，提高转化信任',
          targetUser: '对产品感兴趣但觉得价格偏高的人群',
          userPainPoint: '不理解产品价值来源',
          commentEvidence: ['这个和几十块的有什么区别？', '贵在哪里？'],
          coreJudgment: '用户不是嫌贵，是不理解价值来源',
          contentDirection: '做一条"贵在哪里"的价值拆解视频',
          titleOptions: [
            '它凭什么比平替贵？看完这3点再决定',
            '评论区都在问贵在哪里，我一次讲清楚',
            '几十块平替和它到底差在哪？',
          ],
          hook: '评论区都在问：它到底凭什么比几十块的贵？',
          structure: ['展示评论质疑', '承认疑问合理', '拆解3个差异', '展示真实反馈', '说明适合人群', '引导评论'],
          materialNeeds: ['评论截图', '产品对比图', '成分对比图', '用户反馈截图'],
          sellingPoints: '3个核心差异：成分浓度、使用周期、安全认证',
          proofMechanism: '对比实验数据 + 真实用户前后对比',
          cta: '你觉得最需要对比哪一点？评论区告诉我',
          commentGuide: '引导用户评论下一个想看的对比对象',
          adFitSuggestion: '适合小预算测试，建议测试3版开头',
          acceptanceCriteria: ['必须直接回应价格质疑', '必须有具体对比', '不能只说高级品质好', '必须明确适合人群'],
          verificationMetrics: ['CTR', '商品点击率', '价格异议评论占比', 'CVR'],
        })
      : JSON.stringify({
          contentGoal: '分肤质使用教程，提升收藏',
          targetUser: '油皮/干皮用户，对产品适配有疑问',
          titleOptions: ['油皮怎么用？干皮怎么用？一篇讲清楚', '混油皮的真实使用感受', '不同肤质用它效果差多少？'],
          coverText: '油皮vs干皮 使用全攻略',
          coreKeywords: ['肤质', '使用方法', '真实感受', '油皮', '干皮'],
          searchLayout: '布局"油皮+产品名""干皮+产品名"等长尾关键词',
          bodyStructure: ['开头：肤质自测引导', '中段：分肤质步骤详解', '结尾：常见问题Q&A'],
          noteType: '图文教程 + 收藏清单',
          collectionPoints: ['肤质自测表', '使用步骤清单', '搭配建议'],
          materialNeeds: ['肤质对比图', '使用步骤图', '前后对比图'],
          sellingPoints: '不同肤质的不同效果展示',
          proofMechanism: '真实使用记录 + 周期对比',
          interactionQuestions: ['你是什么肤质？', '还有其他使用问题吗？'],
          cta: '收藏这篇，下次不知道怎么用就翻出来看',
          avoidanceTips: ['不要只说"适合所有肤质"', '不要忽略敏感肌'],
          acceptanceCriteria: ['必须有分肤质具体步骤', '必须有真实使用场景', '必须有Q&A环节'],
        });

    const card = await prisma.productionCard.create({
      data: {
        taskId,
        platform: platform || 'douyin',
        cardJson,
        status: 'pending',
      },
    });

    return { message: '生产卡生成完成', card };
  });
}
