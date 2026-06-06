/**
 * Agent Skill 注册表
 * 
 * 架构：Agent(职责不变) + Skill(动态绑定) = 精准Prompt
 * 
 * Skill 类型：
 * - platform: 平台差异（抖音 vs 小红书）
 * - industry: 行业知识（美妆/3C/食品/服饰等）
 * - goal: 内容目标（种草/转化/曝光/教育等）
 * - depth: 分析深度（完整版 vs 快速版）
 * - output: 输出需求（全量 vs 仅策略 vs 仅洞察）
 */

export interface Skill {
  id: string;
  type: 'platform' | 'industry' | 'goal' | 'depth' | 'output';
  name: string;
  description: string;
  /** Agent级别的Prompt增强 */
  agentPrompts: Record<string, string>;
  /** 全局上下文（注入到所有Agent） */
  globalContext?: string;
}

// ============================================================
// 平台 Skills
// ============================================================

const douyinSkill: Skill = {
  id: 'platform-douyin',
  type: 'platform',
  name: '抖音平台',
  description: '抖音短视频平台分析逻辑',
  globalContext: '当前分析的是抖音内容。抖音是短视频平台，用户行为以刷视频为主，评论互动率高但深度较浅。',
  agentPrompts: {
    'agent-01': '分析抖音内容时，重点关注：前3秒钩子设计、视频节奏、口播话术、评论区引导策略、转化承接方式。抖音用户注意力时间短，内容需要快速抓人。',
    'agent-05': '抖音评论情感分析要点：用户评论通常较短、口语化强、带有网络用语。注意区分"哈哈哈"可能是正向情绪（觉得有趣）而非无意义。',
    'agent-10': '抖音策略要点：1)视频节奏要快，前3秒必须有冲突或悬念 2)多用评论截图作为信任背书 3)CTA要明确引导评论/点赞/关注 4)适合做系列内容连载。',
    'agent-11': '抖音生产卡要点：标题要有冲突感和关键词，前3秒钩子要直接回应用户质疑，中段要有节奏变化，结尾必须引导评论互动。',
    'agent-12': '抖音评论区运营要点：置顶评论要引导下一期内容方向，回复话术要口语化、有网感，善用表情和梗。',
    'agent-13': '抖音投流要点：关注完播率、互动率、转化率。抖音投流适合测试多版开头，A/B测试不同钩子。',
  },
};

const xiaohongshuSkill: Skill = {
  id: 'platform-xiaohongshu',
  type: 'platform',
  name: '小红书平台',
  description: '小红书图文笔记平台分析逻辑',
  globalContext: '当前分析的是小红书内容。小红书是图文+短视频种草平台，用户以搜索+浏览为主，评论质量较高，用户决策链路长。',
  agentPrompts: {
    'agent-01': '分析小红书内容时，重点关注：标题关键词布局、封面文案吸引力、正文结构逻辑、搜索词覆盖、收藏点设计。小红书用户有明确搜索意图，内容需要有收藏价值。',
    'agent-05': '小红书评论情感分析要点：评论通常较长、理性分析多、带有购买决策讨论。注意"种草""拔草"等平台特有表达。',
    'agent-10': '小红书策略要点：1)标题要包含搜索关键词 2)封面要有信息量和美感 3)正文要有干货和收藏价值 4)善用话题标签和评论区互动。',
    'agent-11': '小红书生产卡要点：标题要有搜索关键词+痛点+利益点，封面文案要突出核心信息，正文要有逻辑分段和收藏引导，图片要有信息增量。',
    'agent-12': '小红书评论区运营要点：回复要有专业深度，善用置顶功能补充正文信息，引导用户收藏和私信。',
    'agent-13': '小红书投流要点：关注收藏率、互动率、私信转化。小红书投流适合种草型内容，注重长尾搜索流量。',
  },
};

// ============================================================
// 行业 Skills
// ============================================================

const beautySkill: Skill = {
  id: 'industry-beauty',
  type: 'industry',
  name: '美妆护肤',
  description: '美妆护肤行业分析知识',
  globalContext: '当前分析的是美妆护肤行业产品。用户关注：成分、效果、肤质适配、安全性、性价比。常见评论信号：求链接、适合XX肤质吗、用了过敏、和XX比哪个好。',
  agentPrompts: {
    'agent-01': '美妆内容分析要点：关注成分展示是否专业、效果对比是否有说服力、肤质说明是否清晰、安全认证是否提及。',
    'agent-06': '美妆高价值评论识别：重点关注"求链接""适合XX肤质吗""和XX比哪个好""回购"等评论。这些是转化信号。',
    'agent-07': '美妆需求障碍分析：价格异议(贵/平替)、效果怀疑(有用吗/真的假的)、安全担忧(过敏/成分/敏感肌)、肤质适配(油皮/干皮)、竞品比较(和XX比)。',
    'agent-10': '美妆策略建议：制作成分科普、肤质适配指南、使用前后对比、平替测评等内容形式。',
    'agent-11': '美妆生产卡要点：必须包含成分说明、肤质适配、使用步骤、效果周期、安全提示。',
  },
};

const foodSkill: Skill = {
  id: 'industry-food',
  type: 'industry',
  name: '食品饮料',
  description: '食品饮料行业分析知识',
  globalContext: '当前分析的是食品饮料行业产品。用户关注：口味、配料表、热量、价格、购买渠道。常见评论信号：好吃吗、热量高吗、在哪买、配料干净吗。',
  agentPrompts: {
    'agent-01': '食品内容分析要点：关注口味描述是否具体、配料展示是否透明、食用场景是否清晰、购买渠道是否明确。',
    'agent-06': '食品高价值评论识别：重点关注"好吃吗""在哪买""回购""囤货"等评论。',
    'agent-07': '食品需求障碍分析：口味疑虑、价格敏感、健康担忧(热量/配料)、购买便利性。',
    'agent-10': '食品策略建议：制作口味测评、配料解析、场景化食用指南、囤货攻略等内容。',
    'agent-11': '食品生产卡要点：必须包含口味描述、食用场景、配料说明、购买方式、储存方法。',
  },
};

const techSkill: Skill = {
  id: 'industry-tech',
  type: 'industry',
  name: '3C数码',
  description: '3C数码行业分析知识',
  globalContext: '当前分析的是3C数码产品。用户关注：性能参数、性价比、使用体验、售后保障、对比评测。常见评论信号：配置怎么样、和XX比哪个好、发热吗、续航多久。',
  agentPrompts: {
    'agent-01': '3C内容分析要点：关注参数展示是否清晰、性能对比是否有数据支撑、使用场景是否具体、售后政策是否说明。',
    'agent-06': '3C高价值评论识别：重点关注"配置""性能""对比""推荐"等评论。',
    'agent-07': '3C需求障碍分析：性能疑虑、价格对比、兼容性担忧、售后保障、品牌偏好。',
    'agent-10': '3C策略建议：制作参数对比、使用评测、场景化体验、性价比分析等内容。',
    'agent-11': '3C生产卡要点：必须包含核心参数、性能数据、对比分析、使用场景、售后信息。',
  },
};

// ============================================================
// 目标 Skills
// ============================================================

const seedingGoalSkill: Skill = {
  id: 'goal-seeding',
  type: 'goal',
  name: '种草收藏',
  description: '以种草收藏为核心目标',
  globalContext: '内容目标是种草收藏。重点关注：收藏点设计、关键词布局、信任建立、购买欲望激发。',
  agentPrompts: {
    'agent-10': '种草策略：重点设计收藏价值点，如清单、对比表、使用指南等。标题要有搜索关键词，正文要有干货。',
    'agent-11': '种草生产卡：必须有收藏引导设计、关键词布局、干货内容、信任背书。',
  },
};

const conversionGoalSkill: Skill = {
  id: 'goal-conversion',
  type: 'goal',
  name: '转化成交',
  description: '以转化成交为核心目标',
  globalContext: '内容目标是转化成交。重点关注：购买理由、价格锚点、紧迫感、CTA设计、信任背书。',
  agentPrompts: {
    'agent-10': '转化策略：重点设计购买理由和价格锚点，强化效果证明，降低决策门槛。CTA要明确引导下单/咨询。',
    'agent-11': '转化生产卡：必须有购买理由、价格锚点、效果证明、限时优惠、明确CTA。',
  },
};

const exposureGoalSkill: Skill = {
  id: 'goal-exposure',
  type: 'goal',
  name: '拉新曝光',
  description: '以拉新曝光为核心目标',
  globalContext: '内容目标是拉新曝光。重点关注：话题性、传播性、钩子设计、互动引导、算法友好。',
  agentPrompts: {
    'agent-10': '曝光策略：重点设计话题性和传播钩子，制造讨论点，引导用户互动和分享。内容要有争议性或共鸣感。',
    'agent-11': '曝光生产卡：必须有强钩子、话题标签、互动引导、争议点设计、分享激励。',
  },
};

// ============================================================
// 深度 Skills
// ============================================================

const fullDepthSkill: Skill = {
  id: 'depth-full',
  type: 'depth',
  name: '完整分析',
  description: '17个Agent全量执行，适合深度诊断',
  agentPrompts: {},
};

const quickDepthSkill: Skill = {
  id: 'depth-quick',
  type: 'depth',
  name: '快速分析',
  description: '仅执行核心Agent，适合快速概览',
  agentPrompts: {
    'agent-00': '快速模式：只需输出最关键的3-5条核心结论，不需要详细展开。',
    'agent-10': '快速模式：只生成1-2条P0策略卡，不需要P1/P2。',
  },
};

// ============================================================
// 输出 Skills
// ============================================================

const fullOutputSkill: Skill = {
  id: 'output-full',
  type: 'output',
  name: '全量输出',
  description: '输出所有模块：洞察+策略+生产卡+运营+投流+质检',
  agentPrompts: {},
};

const insightOnlySkill: Skill = {
  id: 'output-insights',
  type: 'output',
  name: '仅洞察',
  description: '仅输出评论洞察和归因，不生成策略和生产卡',
  agentPrompts: {
    'agent-10': '仅洞察模式：不需要生成策略卡，此Agent跳过。',
    'agent-11': '仅洞察模式：不需要生成生产卡，此Agent跳过。',
    'agent-12': '仅洞察模式：不需要生成运营方案，此Agent跳过。',
  },
};

const strategyOnlySkill: Skill = {
  id: 'output-strategy',
  type: 'output',
  name: '仅策略',
  description: '仅输出策略卡和生产卡',
  agentPrompts: {
    'agent-10': '仅策略模式：专注于策略卡生成，每条策略必须有明确的评论证据支撑。',
    'agent-11': '仅策略模式：专注于生产卡生成，每张卡必须可直接派单执行。',
  },
};

// ============================================================
// 注册表
// ============================================================

export const SKILL_REGISTRY: Record<string, Skill> = {
  'platform-douyin': douyinSkill,
  'platform-xiaohongshu': xiaohongshuSkill,
  'industry-beauty': beautySkill,
  'industry-food': foodSkill,
  'industry-tech': techSkill,
  'goal-seeding': seedingGoalSkill,
  'goal-conversion': conversionGoalSkill,
  'goal-exposure': exposureGoalSkill,
  'depth-full': fullDepthSkill,
  'depth-quick': quickDepthSkill,
  'output-full': fullOutputSkill,
  'output-insights': insightOnlySkill,
  'output-strategy': strategyOnlySkill,
};

/** 根据任务上下文自动选择Skills */
export function autoSelectSkills(task: {
  platform: string;
  industry?: string;
  contentGoal?: string;
  outputOptions?: string[];
}): Skill[] {
  const skills: Skill[] = [];

  // 平台Skill
  if (task.platform === 'douyin') skills.push(douyinSkill);
  else if (task.platform === 'xiaohongshu') skills.push(xiaohongshuSkill);

  // 行业Skill
  if (task.industry) {
    const industryLower = task.industry.toLowerCase();
    if (industryLower.includes('美妆') || industryLower.includes('护肤') || industryLower.includes('化妆')) {
      skills.push(beautySkill);
    } else if (industryLower.includes('食品') || industryLower.includes('饮料') || industryLower.includes('餐饮')) {
      skills.push(foodSkill);
    } else if (industryLower.includes('数码') || industryLower.includes('3c') || industryLower.includes('电子')) {
      skills.push(techSkill);
    }
  }

  // 目标Skill
  if (task.contentGoal === 'seeding' || task.contentGoal === '种草收藏') {
    skills.push(seedingGoalSkill);
  } else if (task.contentGoal === 'conversion' || task.contentGoal === '转化成交') {
    skills.push(conversionGoalSkill);
  } else if (task.contentGoal === 'exposure' || task.contentGoal === '拉新曝光') {
    skills.push(exposureGoalSkill);
  }

  // 深度Skill（默认完整）
  skills.push(fullDepthSkill);

  // 输出Skill
  if (task.outputOptions?.includes('full') || !task.outputOptions?.length) {
    skills.push(fullOutputSkill);
  }

  return skills;
}

/** 为指定Agent组装增强后的System Prompt */
export function buildAgentPrompt(
  agentCode: string,
  basePrompt: string,
  skills: Skill[]
): string {
  const parts: string[] = [basePrompt];

  // 全局上下文
  const globalContexts = skills
    .map((s) => s.globalContext)
    .filter(Boolean);
  if (globalContexts.length > 0) {
    parts.push('\n## 分析上下文\n' + globalContexts.join('\n'));
  }

  // Agent专属增强
  const agentEnhancements = skills
    .map((s) => s.agentPrompts[agentCode])
    .filter(Boolean);
  if (agentEnhancements.length > 0) {
    parts.push('\n## 针对性指导\n' + agentEnhancements.join('\n\n'));
  }

  return parts.join('\n');
}
