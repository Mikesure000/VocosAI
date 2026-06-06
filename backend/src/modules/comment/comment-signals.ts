/**
 * 评论信号分类系统
 * 基于 PRD 第 8.3 节和 Vocos 4.0 的 13 个垂直标签体系
 */

export interface CommentSignal {
  key: string;
  label: string;
  category: 'intent' | 'barrier' | 'sentiment' | 'action';
  description: string;
  examples: string[];
}

export const COMMENT_SIGNALS: CommentSignal[] = [
  {
    key: 'purchase_intent',
    label: '购买意图',
    category: 'intent',
    description: '明确表达购买意愿或询价行为',
    examples: ['求链接', '怎么买', '多少钱', '哪里买', '已下单', '已加购'],
  },
  {
    key: 'price_objection',
    label: '价格异议',
    category: 'barrier',
    description: '对价格表示疑虑或不理解',
    examples: ['贵', '贵在哪里', '不值这个价', '平替推荐', '智商税'],
  },
  {
    key: 'effect_skepticism',
    label: '效果怀疑',
    category: 'barrier',
    description: '对产品效果表示怀疑',
    examples: ['有用吗', '真的假的', '效果怎么样', '用过的说说', '是不是吹的'],
  },
  {
    key: 'safety_concern',
    label: '安全担忧',
    category: 'barrier',
    description: '对产品安全性有疑虑',
    examples: ['安全吗', '有副作用吗', '成分安全吗', '敏感肌能用吗', '孕妇能用吗'],
  },
  {
    key: 'usage_question',
    label: '使用疑问',
    category: 'action',
    description: '询问使用方法或适用场景',
    examples: ['怎么用', '适合油皮吗', '干皮能用吗', '什么时候用', '搭配什么用'],
  },
  {
    key: 'audience_fit',
    label: '人群适配',
    category: 'barrier',
    description: '询问是否适合特定人群',
    examples: ['适合学生党吗', '妈妈能用吗', '30岁适合吗', '男生能用吗'],
  },
  {
    key: 'competitor_comparison',
    label: '竞品比较',
    category: 'intent',
    description: '与其他品牌或产品对比',
    examples: ['和XX比哪个好', '平替', '还不如买XX', 'XX更好用', '同类对比'],
  },
  {
    key: 'negative_experience',
    label: '负面体验',
    category: 'sentiment',
    description: '表达不满或负面使用体验',
    examples: ['不好用', '过敏了', '踩雷', '后悔买了', '千万别买'],
  },
  {
    key: 'repurchase_signal',
    label: '复购信号',
    category: 'intent',
    description: '表达再次购买的意愿',
    examples: ['回购', '囤货', '用完了再买', '一直用', '真爱'],
  },
  {
    key: 'dm_consult_signal',
    label: '私信咨询信号',
    category: 'action',
    description: '表达私下沟通的意愿',
    examples: ['私', '私信', '怎么联系', '加微信', 'V我'],
  },
  {
    key: 'scenario_need',
    label: '场景需求',
    category: 'intent',
    description: '表达特定场景下的需求',
    examples: ['约会用', '上班通勤', '出门旅游', '见家长', '面试用'],
  },
  {
    key: 'ingredient_focus',
    label: '成分关注',
    category: 'intent',
    description: '关注产品成分或配方',
    examples: ['含酒精吗', '有香精吗', '成分表发一下', 'XX成分含量多少'],
  },
  {
    key: 'trust_gap',
    label: '信任缺口',
    category: 'barrier',
    description: '对品牌或内容真实性有质疑',
    examples: ['广告吧', '收钱了吧', '托', '博主自己用过吗', '是不是推广'],
  },
];

// Simple keyword-based signal detection
export function detectSignals(commentText: string): string[] {
  const text = commentText.toLowerCase();
  const detected: string[] = [];

  const keywordMap: Record<string, string[]> = {
    purchase_intent: ['求链接', '怎么买', '多少钱', '哪里买', '下单', '加购', '想要', '买它', '链接'],
    price_objection: ['贵', '不值', '平替', '智商税', '贵在哪里', '便宜'],
    effect_skepticism: ['有用吗', '真的假的', '效果', '管用', '有效', '吹的', '忽悠'],
    safety_concern: ['安全', '副作用', '过敏', '成分安全', '敏感肌', '孕妇'],
    usage_question: ['怎么用', '适合', '能用吗', '什么时候', '搭配', '方法'],
    audience_fit: ['学生', '妈妈', '男生', '女生', '年龄', '适合我吗'],
    competitor_comparison: ['和', '比', '哪个好', '更好', '不如', '平替', 'XX'],
    negative_experience: ['不好用', '踩雷', '后悔', '千万别买', '垃圾', '差评'],
    repurchase_signal: ['回购', '囤货', '再买', '一直用', '真爱', '用完了'],
    dm_consult_signal: ['私', '私信', '联系', '加微信', 'v我'],
    scenario_need: ['约会', '上班', '通勤', '旅游', '见家长', '面试', '场景'],
    ingredient_focus: ['成分', '酒精', '香精', '配方', '含量', '添加'],
    trust_gap: ['广告', '收钱', '托', '推广', '博主自己', '真的用过'],
  };

  for (const [signal, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => text.includes(kw))) {
      detected.push(signal);
    }
  }

  return detected;
}

// Get signal display info
export function getSignalInfo(key: string): CommentSignal | undefined {
  return COMMENT_SIGNALS.find((s) => s.key === key);
}

// Get all signals
export function getAllSignals(): CommentSignal[] {
  return COMMENT_SIGNALS;
}
