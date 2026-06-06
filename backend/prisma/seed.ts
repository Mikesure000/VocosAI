import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vocosai.com' },
    update: {},
    create: {
      email: 'admin@vocosai.com',
      name: '系统管理员',
      passwordHash: adminPassword,
      role: 'super_admin',
    },
  });

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@vocosai.com' },
    update: {},
    create: {
      email: 'demo@vocosai.com',
      name: '演示用户',
      passwordHash: demoPassword,
      role: 'member',
    },
  });

  // Create default team
  const team = await prisma.team.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      teamName: '默认团队',
      ownerUserId: admin.id,
      planType: 'free',
      monthlyQuota: 1000000,
    },
  });

  // Add members to team
  await prisma.teamMember.upsert({
    where: { id: 'admin-member' },
    update: {},
    create: {
      id: 'admin-member',
      teamId: team.id,
      userId: admin.id,
      role: 'team_admin',
    },
  });

  await prisma.teamMember.upsert({
    where: { id: 'demo-member' },
    update: {},
    create: {
      id: 'demo-member',
      teamId: team.id,
      userId: demo.id,
      role: 'member',
    },
  });

  // Create demo project
  await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      teamId: team.id,
      projectName: '示例项目 - 美妆品牌内容优化',
      brandName: '完美日记',
      productName: '小细跟口红',
      industry: '美妆护肤',
      description: '通过评论区分析优化抖音和小红书内容策略',
      createdBy: demo.id,
    },
  });

  // Create default model providers
  await prisma.modelProvider.upsert({
    where: { id: 'provider-deepseek' },
    update: {},
    create: {
      id: 'provider-deepseek',
      providerName: 'deepseek',
      baseUrl: 'https://api.deepseek.com',
      apiKeyEncrypted: 'placeholder',
      status: 'active',
    },
  });

  await prisma.modelProvider.upsert({
    where: { id: 'provider-openai' },
    update: {},
    create: {
      id: 'provider-openai',
      providerName: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKeyEncrypted: 'placeholder',
      status: 'active',
    },
  });

  // Create model configs
  await prisma.modelConfig.upsert({
    where: { id: 'model-deepseek-flash' },
    update: {},
    create: {
      id: 'model-deepseek-flash',
      providerId: 'provider-deepseek',
      modelName: 'deepseek-v4-flash',
      modelType: 'chat',
      contextWindow: 128000,
      inputTokenPrice: 0.002,
      outputTokenPrice: 0.004,
      isActive: true,
    },
  });

  await prisma.modelConfig.upsert({
    where: { id: 'model-deepseek-pro' },
    update: {},
    create: {
      id: 'model-deepseek-pro',
      providerId: 'provider-deepseek',
      modelName: 'deepseek-v4-pro',
      modelType: 'reasoning',
      contextWindow: 128000,
      inputTokenPrice: 0.004,
      outputTokenPrice: 0.008,
      isActive: true,
    },
  });

  // Create AI Agents
  const agentDefs = [
    { code: 'agent-00', name: '任务理解与目标识别', order: 0 },
    { code: 'agent-01', name: '原内容拆解', order: 1, parallel: true },
    { code: 'agent-02', name: '评论去重清洗', order: 2, parallel: true },
    { code: 'agent-03', name: '水军与无效评论过滤', order: 3 },
    { code: 'agent-04', name: '多轮对话清洗', order: 4 },
    { code: 'agent-05', name: '情感深度分析', order: 5, parallel: true },
    { code: 'agent-06', name: '高价值评论筛选', order: 6, parallel: true },
    { code: 'agent-07', name: '用户需求与购买障碍识别', order: 7 },
    { code: 'agent-08', name: '内容-评论归因', order: 8 },
    { code: 'agent-09', name: '内容价值类型识别', order: 9 },
    { code: 'agent-10', name: '平台策略生成', order: 10 },
    { code: 'agent-11', name: '内容生产卡生成', order: 11, parallel: true },
    { code: 'agent-12', name: '评论区运营', order: 12, parallel: true },
    { code: 'agent-13', name: '投流适配评分', order: 13 },
    { code: 'agent-14', name: '发布前质检', order: 14 },
    { code: 'agent-15', name: '报告组装', order: 15 },
    { code: 'agent-16', name: 'AI 质量评估', order: 16 },
  ];

  for (const agent of agentDefs) {
    await prisma.aiAgent.upsert({
      where: { agentCode: agent.code },
      update: {},
      create: {
        agentCode: agent.code,
        agentName: agent.name,
        executionOrder: agent.order,
        canParallel: agent.parallel || false,
      },
    });
  }

  console.log('Seed completed!');
  console.log('Admin login: admin@vocosai.com / admin123');
  console.log('Demo login: demo@vocosai.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
