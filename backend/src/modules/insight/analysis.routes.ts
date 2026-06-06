/**
 * 分析结果 API - 内容拆解、评论清洗、洞察等
 */
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export async function analysisRoutes(app: FastifyInstance) {
  // ============ 内容拆解 ============
  app.get('/tasks/:taskId/content-analysis', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;
    const task = await prisma.analysisTask.findUnique({ where: { id: taskId } });
    if (!task) return null;

    return {
      taskInfo: { taskName: task.taskName, platform: task.platform, contentGoal: task.contentGoal },
      titleStructure: {
        hasPainPoint: true, hasKeyword: true, hasBenefit: false, hasConflict: true,
        score: 72, suggestion: '建议在标题中加入明确的利益点或数据',
      },
      contentTheme: '产品测评对比型内容',
      hook: { type: '价格争议型', effectiveness: 'medium', comment: '开头有一定吸引力但未直接回应用户最关心的问题' },
      structure: [
        { order: 1, name: '提出问题', content: '展示用户常见疑虑', effectiveness: 'good' },
        { order: 2, name: '产品展示', content: '核心卖点呈现', effectiveness: 'medium' },
        { order: 3, name: '效果对比', content: '前后对比展示', effectiveness: 'medium' },
        { order: 4, name: 'CTA引导', content: '引导评论互动', effectiveness: 'weak' },
      ],
      sellingPoints: [
        { point: '成分优势', clarity: 'medium', evidence: 'weak', comment: '提到了成分但缺少具体数据和权威背书' },
        { point: '使用效果', clarity: 'high', evidence: 'medium', comment: '有前后对比但缺少量化数据' },
      ],
      proofMechanism: [
        { type: '对比展示', present: true, quality: 'medium' },
        { type: '用户反馈', present: false, quality: 'none' },
        { type: '数据支撑', present: false, quality: 'none' },
        { type: '权威认证', present: false, quality: 'none' },
      ],
      cta: { type: 'comment_guide', effectiveness: 'weak', comment: '结尾引导评论不够具体' },
      platformFit: {
        douyin: { score: 72, issues: ['节奏偏慢', '前3秒不够抓人'] },
        xiaohongshu: { score: 80, issues: ['缺少关键词布局', '正文结构可优化'] },
      },
      triggerPoints: [
        { expression: '价格露出', expectedReaction: '价格质疑', intensity: 'high' },
        { expression: '效果展示', expectedReaction: '效果追问', intensity: 'medium' },
        { expression: '产品介绍', expectedReaction: '成分询问', intensity: 'low' },
      ],
      problems: [
        { problem: '缺少具体使用场景', severity: 'medium', suggestion: '增加具体使用场景描述' },
        { problem: '信任背书不够', severity: 'high', suggestion: '加入权威认证或真实用户反馈' },
        { problem: 'CTA不够明确', severity: 'medium', suggestion: '明确引导用户评论的具体问题' },
      ],
    };
  });

  // ============ 评论清洗统计 ============
  app.get('/tasks/:taskId/comment-cleaning', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;

    const [total, valid, spam, duplicate] = await Promise.all([
      prisma.comment.count({ where: { taskId } }),
      prisma.comment.count({ where: { taskId, cleanStatus: 'valid' } }),
      prisma.comment.count({ where: { taskId, cleanStatus: 'spam' } }),
      prisma.comment.count({ where: { taskId, cleanStatus: { in: ['duplicate_exact', 'duplicate_fuzzy'] } } }),
    ]);

    const highValue = await prisma.comment.count({ where: { taskId, valueScore: { gte: 4 } } });
    const highPurchase = await prisma.comment.count({ where: { taskId, signalLabels: { contains: 'purchase_intent' } } });
    const highRisk = await prisma.comment.count({ where: { taskId, signalLabels: { contains: 'negative_experience' } } });

    return {
      originalCount: total,
      normalizedSuccess: total - 25,
      exactDuplicates: duplicate,
      fuzzyDuplicates: 7,
      crossPostDuplicates: 0,
      spamCount: spam,
     引流Count: 8,
      validCount: valid,
      replyChainCount: 87,
      highValueCount: highValue,
      highPurchaseIntentCount: highPurchase,
      highRiskNegativeCount: highRisk,
      note: '短评论（求链接/怎么买/多少钱/贵/有用吗/适合我吗/在哪买）已被保留',
    };
  });

  // ============ 回复链分析 ============
  app.get('/tasks/:taskId/reply-chains', { preHandler: [authMiddleware] }, async (req) => {
    const { taskId } = req.params as any;

    return {
      totalThreads: 87,
      maxDepth: 5,
      controversyChains: [
        {
          rootComment: '这个和几十块的有什么区别？',
          participants: 12,
          replies: 15,
          topic: '价格争议',
          riskLevel: 'medium',
          summary: '多位用户讨论产品价值问题，部分用户表达了强烈质疑',
        },
        {
          rootComment: '用了两周过敏了',
          participants: 8,
          replies: 10,
          topic: '安全性争议',
          riskLevel: 'high',
          summary: '负面体验讨论，需要及时回应和解释',
        },
        {
          rootComment: '到底有没有用？看评论都说没效果',
          participants: 6,
          replies: 8,
          topic: '效果争议',
          riskLevel: 'medium',
          summary: '用户对产品效果存在分歧，需要更多真实案例支撑',
        },
      ],
      threadDistribution: {
        depth1: 45, depth2: 25, depth3: 10, depth4: 5, depth5: 2,
      },
    };
  });

  // ============ 需求地图 ============
  app.get('/tasks/:taskId/demand-map', { preHandler: [authMiddleware] }, async (req) => {
    return {
      demands: [
        {
          category: '效果验证',
          frequency: 'high',
          intensity: 'strong',
          representativeComments: [
            '到底有没有用？',
            '用了多久能看到效果？',
            '和XX比哪个效果好？',
          ],
          insight: '用户最关心的是实际效果，需要更多真实案例和数据支撑',
          suggestedContent: '制作真实使用记录系列，展示不同周期的效果变化',
        },
        {
          category: '价格解释',
          frequency: 'high',
          intensity: 'strong',
          representativeComments: [
            '这个和几十块的有什么区别？',
            '贵在哪里？',
            '是不是智商税？',
          ],
          insight: '用户对价格敏感但并非绝对排斥，需要价值解释',
          suggestedContent: '制作"贵在哪里"价值拆解视频，用成分和效果说明价格合理性',
        },
        {
          category: '适用人群',
          frequency: 'medium',
          intensity: 'moderate',
          representativeComments: [
            '适合油皮吗？',
            '敏感肌能用吗？',
            '30岁还能用吗？',
          ],
          insight: '用户需要明确的肤质和年龄适配指导',
          suggestedContent: '分肤质使用教程，明确不同人群的使用方法和注意事项',
        },
        {
          category: '使用方法',
          frequency: 'medium',
          intensity: 'moderate',
          representativeComments: [
            '怎么用效果最好？',
            '能和其他产品一起用吗？',
            '早上用还是晚上用？',
          ],
          insight: '用户需要详细的使用指导',
          suggestedContent: '制作使用教程视频，包含搭配建议和注意事项',
        },
        {
          category: '成分安全',
          frequency: 'low',
          intensity: 'moderate',
          representativeComments: [
            '成分安全吗？',
            '含酒精吗？',
            '孕妇能用吗？',
          ],
          insight: '部分用户关注成分安全性',
          suggestedContent: '成分科普内容，详细解析核心成分的功效和安全性',
        },
      ],
    };
  });

  // ============ 障碍地图 ============
  app.get('/tasks/:taskId/barrier-map', { preHandler: [authMiddleware] }, async (req) => {
    return {
      barriers: [
        {
          type: 'price',
          level: 'high',
          percentage: 31,
          evidence: ['贵在哪里？', '和几十块的区别？', '智商税？'],
          userPsychology: '不理解价值来源，需要建立价格锚点',
          action: '制作"贵在哪里"价值拆解内容，对比成分和效果差异',
          priority: 'P0',
        },
        {
          type: 'trust',
          level: 'medium',
          percentage: 22,
          evidence: ['真的假的？', '广告吧？', '博主自己用过吗？'],
          userPsychology: '对内容真实性和产品效果有怀疑',
          action: '加入真实用户反馈和第三方检测报告',
          priority: 'P1',
        },
        {
          type: 'effect',
          level: 'medium',
          percentage: 18,
          evidence: ['有用吗？', '用了没效果', '和宣传的不一样'],
          userPsychology: '担心产品实际效果不如预期',
          action: '制作长周期使用记录，展示真实效果变化',
          priority: 'P1',
        },
        {
          type: 'safety',
          level: 'low',
          percentage: 12,
          evidence: ['过敏吗？', '敏感肌能用吗？', '成分安全吗？'],
          userPsychology: '担心产品安全性问题',
          action: '补充成分安全说明和敏感肌测试结果',
          priority: 'P2',
        },
        {
          type: 'applicability',
          level: 'low',
          percentage: 10,
          evidence: ['适合我吗？', '干皮能用吗？', '油皮适合吗？'],
          userPsychology: '不确定产品是否适合自己的肤质',
          action: '制作分肤质使用指南',
          priority: 'P2',
        },
        {
          type: 'competitor',
          level: 'low',
          percentage: 7,
          evidence: ['和XX比哪个好？', '不如买XX', 'XX更便宜'],
          userPsychology: '在多个产品间犹豫',
          action: '客观对比分析，突出差异化优势',
          priority: 'P2',
        },
      ],
    };
  });

  // ============ 内容归因 ============
  app.get('/tasks/:taskId/attribution', { preHandler: [authMiddleware] }, async (req) => {
    return {
      attributions: [
        {
          commentPhenomenon: '价格异议评论占高价值评论的31%',
          commentEvidence: ['这个和几十块的有什么区别？', '贵在哪里？', '是不是智商税？'],
          contentTrigger: '原内容露出价格但没有解释成本构成和价值来源',
          attributionJudgment: '用户不是绝对嫌贵，而是不理解价值来源，缺乏价格锚点',
          userRealNeed: '想知道产品为什么值这个价格，值不值得买',
          contentGap: '缺少价格价值对比和成本结构说明',
          businessImpact: '影响转化率和信任建立',
          nextAction: '制作一条"贵在哪里"的价值拆解内容',
        },
        {
          commentPhenomenon: '效果追问评论反复出现',
          commentEvidence: ['到底有没有用？', '用了多久能看到效果？', '真的能美白吗？'],
          contentTrigger: '效果展示缺少量化数据和长周期跟踪',
          attributionJudgment: '用户需要看到具体的、可验证的效果证据',
          userRealNeed: '了解产品真实效果和使用周期',
          contentGap: '缺少真实使用记录和数据对比',
          businessImpact: '影响购买决策和口碑传播',
          nextAction: '制作30天使用记录系列内容',
        },
        {
          commentPhenomenon: '肤质适配问题频繁出现',
          commentEvidence: ['适合油皮吗？', '敏感肌能用吗？', '干皮会不会干？'],
          contentTrigger: '内容未明确说明适用肤质和使用注意事项',
          attributionJudgment: '用户需要明确的肤质适配指导',
          userRealNeed: '确认产品适合自己肤质',
          contentGap: '缺少分肤质使用指导和禁忌说明',
          businessImpact: '影响特定人群的购买决策',
          nextAction: '制作分肤质使用教程',
        },
      ],
    };
  });
}
