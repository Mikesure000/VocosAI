/**
 * Model Gateway - 统一模型调用入口
 * 基于 Vocos 4.0 的 model-gateway.mjs 设计理念
 * 核心职责：路由、降级、重试、Token 统计、成本计算
 */

interface ModelCallParams {
  agentCode: string;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'json_object' | 'text';
  temperature?: number;
  maxTokens?: number;
}

interface ModelCallResult {
  success: boolean;
  content: string;
  modelName: string;
  providerName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  retryCount: number;
  fallbackUsed: boolean;
  error?: string;
}

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  models: {
    name: string;
    type: 'fast' | 'reasoning' | 'powerful';
    inputPrice: number; // per 1K tokens
    outputPrice: number; // per 1K tokens
  }[];
}

// Agent → Model 路由映射
const AGENT_MODEL_MAP: Record<string, { primary: string; fallback?: string }> = {
  'agent-00': { primary: 'deepseek-v4-flash' },
  'agent-01': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-02': { primary: 'deepseek-v4-flash' },
  'agent-03': { primary: 'deepseek-v4-flash' },
  'agent-04': { primary: 'deepseek-v4-flash' },
  'agent-05': { primary: 'deepseek-v4-flash', fallback: 'gpt-4.1-mini' },
  'agent-06': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-07': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-08': { primary: 'gpt-4.1', fallback: 'deepseek-v4-pro' },
  'agent-09': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-10': { primary: 'gpt-4.1', fallback: 'deepseek-v4-pro' },
  'agent-11': { primary: 'gpt-4.1', fallback: 'deepseek-v4-pro' },
  'agent-12': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-13': { primary: 'gpt-4.1', fallback: 'deepseek-v4-pro' },
  'agent-14': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-15': { primary: 'deepseek-v4-pro', fallback: 'gpt-4.1' },
  'agent-16': { primary: 'deepseek-v4-flash' },
};

export class ModelGateway {
  private providers: Record<string, ProviderConfig> = {};

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (deepseekKey) {
      this.providers['deepseek'] = {
        name: 'deepseek',
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: deepseekKey,
        models: [
          { name: 'deepseek-v4-flash', type: 'fast', inputPrice: 0.002, outputPrice: 0.004 },
          { name: 'deepseek-v4-pro', type: 'reasoning', inputPrice: 0.004, outputPrice: 0.008 },
        ],
      };
    }

    if (openaiKey) {
      this.providers['openai'] = {
        name: 'openai',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: openaiKey,
        models: [
          { name: 'gpt-4.1-mini', type: 'fast', inputPrice: 0.02, outputPrice: 0.08 },
          { name: 'gpt-4.1', type: 'powerful', inputPrice: 0.04, outputPrice: 0.16 },
        ],
      };
    }
  }

  /**
   * 智能调用：live模式下尝试真实API，失败回退mock
   */
  async smartCall(params: ModelCallParams): Promise<ModelCallResult> {
    const mode = process.env.VOCOS_MODEL_MODE || 'mock';
    if (mode === 'live') {
      const hasKeys = !!(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY);
      if (hasKeys) {
        const result = await this.call(params);
        if (result.success) return result;
        console.warn('[ModelGateway] Live call failed, falling back to mock:', result.error);
      }
    }
    return this.mockCall(params);
  }

  /**
   * 调用模型（含路由、降级、重试）
   */
  async call(params: ModelCallParams): Promise<ModelCallResult> {
    const startTime = Date.now();
    const route = AGENT_MODEL_MAP[params.agentCode] || { primary: 'deepseek-v4-flash' };
    const models = [route.primary, route.fallback].filter(Boolean) as string[];

    let lastError: string | undefined;
    let retryCount = 0;
    let fallbackUsed = false;

    for (const modelName of models) {
      if (fallbackUsed) retryCount++;

      const provider = this.findProvider(modelName);
      if (!provider) {
        lastError = `No provider found for model: ${modelName}`;
        continue;
      }

      const modelConfig = provider.models.find((m) => m.name === modelName);
      if (!modelConfig) {
        lastError = `Model not found: ${modelName}`;
        continue;
      }

      try {
        const result = await this.callProvider(provider, modelName, params);
        const latencyMs = Date.now() - startTime;
        const inputTokens = this.estimateTokens(params.systemPrompt + params.userPrompt);
        const outputTokens = this.estimateTokens(result);
        const totalTokens = inputTokens + outputTokens;
        const cost = (inputTokens / 1000) * modelConfig.inputPrice +
                     (outputTokens / 1000) * modelConfig.outputPrice;

        return {
          success: true,
          content: result,
          modelName,
          providerName: provider.name,
          inputTokens,
          outputTokens,
          totalTokens,
          cost: Math.round(cost * 10000) / 10000,
          latencyMs,
          retryCount,
          fallbackUsed,
        };
      } catch (err: any) {
        lastError = err.message || String(err);
        fallbackUsed = true;
        console.warn(`[ModelGateway] ${modelName} failed: ${lastError}, trying fallback...`);
      }
    }

    return {
      success: false,
      content: '',
      modelName: models[0] || 'unknown',
      providerName: 'unknown',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - startTime,
      retryCount,
      fallbackUsed,
      error: lastError,
    };
  }

  /**
   * Mock 模式调用（开发环境无 API Key 时使用）
   */
  async mockCall(params: ModelCallParams): Promise<ModelCallResult> {
    const startTime = Date.now();

    // Simulate network latency
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));

    const mockContent = this.generateMockResponse(params.agentCode, params.userPrompt);
    const inputTokens = this.estimateTokens(params.systemPrompt + params.userPrompt);
    const outputTokens = this.estimateTokens(mockContent);

    return {
      success: true,
      content: mockContent,
      modelName: 'mock-model',
      providerName: 'mock',
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: 0,
      latencyMs: Date.now() - startTime,
      retryCount: 0,
      fallbackUsed: false,
    };
  }

  private generateMockResponse(agentCode: string, userPrompt: string): string {
    const mockResponses: Record<string, string> = {
      'agent-00': JSON.stringify({ taskType: 'content_analysis', goals: ['拉新曝光', '种草收藏'], outputModules: ['full'] }),
      'agent-01': JSON.stringify({
        titleStructure: { hasPainPoint: true, hasKeyword: true, hasBenefit: false, score: 72 },
        contentTheme: '产品测评对比',
        hook: '价格争议型开头',
        structure: ['提出问题', '展示对比', '给出结论', '引导评论'],
        sellingPoints: [{ point: '成分优势', clarity: 'medium', evidence: 'weak' }],
        cta: { type: 'comment_guide', effectiveness: 'medium' },
        platformFit: { douyin: 'good', xiaohongshu: 'excellent' },
        triggerPoints: ['价格未解释清楚', '效果证据不足'],
        problems: ['缺少具体使用场景', '信任背书不够'],
      }),
      'agent-02': JSON.stringify({
        originalCount: 1523,
        normalizedCount: 1498,
        exactDuplicates: 18,
        fuzzyDuplicates: 7,
        crossPostDuplicates: 0,
        validCount: 1473,
      }),
      'agent-03': JSON.stringify({
        spamCount: 45,
        invalidCount: 23,
       引流Count: 8,
        validAfterFilter: 1397,
        spamExamples: ['ddd', '顶', '好', '纯表情刷屏'],
      }),
      'agent-04': JSON.stringify({
        threadCount: 87,
        maxDepth: 5,
        controversyChains: 3,
        highRiskThreads: 2,
        summary: '发现3条争议链，涉及价格质疑和效果争议',
      }),
      'agent-05': JSON.stringify({
        positive: 423, neutral: 612, negative: 258, complex: 104,
        sentimentTargets: {
          price: { positive: 30, negative: 145, neutral: 80 },
          effect: { positive: 120, negative: 67, neutral: 45 },
          packaging: { positive: 55, negative: 12, neutral: 20 },
          service: { positive: 35, negative: 18, neutral: 15 },
        },
      }),
      'agent-06': JSON.stringify({
        totalHighValue: 287,
        categories: {
          purchaseIntent: 89, priceObjection: 52, competitorComparison: 45,
          usageQuestion: 38, scenarioNeed: 28, effectSkepticism: 20,
          safetyConcern: 8, repurchaseSignal: 7,
        },
        topComments: [
          { text: '这个和几十块的有什么区别？', score: 5, category: 'priceObjection' },
          { text: '求链接！！！', score: 5, category: 'purchaseIntent' },
          { text: '适合油皮吗？', score: 4, category: 'usageQuestion' },
          { text: '用了半个月真的白了！', score: 5, category: 'repurchaseSignal' },
        ],
      }),
      'agent-07': JSON.stringify({
        demands: [
          { category: '效果验证', frequency: 'high', intensity: 'strong', evidence: '多人追问真实效果' },
          { category: '价格解释', frequency: 'high', intensity: 'strong', evidence: '31%高价值评论涉及价格' },
          { category: '适用人群', frequency: 'medium', intensity: 'moderate', evidence: '肤质适配问题频繁出现' },
        ],
        barriers: [
          { type: 'price', level: 'high', evidence: '不理解价值来源', action: '制作价值拆解内容' },
          { type: 'trust', level: 'medium', evidence: '担心效果不真实', action: '加入真实用户反馈' },
          { type: 'safety', level: 'low', evidence: '成分安全性疑虑', action: '补充成分说明' },
        ],
        competitorMentions: [
          { brand: '花西子', frequency: 23, sentiment: 'neutral', context: '价格对比' },
          { brand: 'MAC', frequency: 15, sentiment: 'positive', context: '品质参考' },
        ],
      }),
      'agent-10': JSON.stringify({
        cards: [
          {
            cardId: 'P0-001', priority: 'P0', title: '制作"贵在哪里"价值拆解视频',
            platform: 'douyin', contentFormat: '口播+对比', goal: '转化成交',
            evidence: ['这个和几十块的有什么区别？', '贵在哪里？', '是不是智商税？'],
            coreJudgment: '用户不是嫌贵，是不理解价值来源',
            riskWarning: '避免贬低竞品，聚焦自身价值',
          },
          {
            cardId: 'P1-001', priority: 'P1', title: '油皮/干皮分肤质使用教程',
            platform: 'xiaohongshu', contentFormat: '图文教程', goal: '种草收藏',
            evidence: ['适合油皮吗？', '干皮会不会干？'],
            coreJudgment: '人群适配信息不足，需补充使用场景',
          },
        ],
      }),
    };

    const response = mockResponses[agentCode];
    if (response) return response;

    // Default structured response
    return JSON.stringify({
      agentCode,
      result: 'mock_response',
      summary: `Mock analysis result for ${agentCode}`,
      timestamp: new Date().toISOString(),
    });
  }

  private async callProvider(
    provider: ProviderConfig,
    modelName: string,
    params: ModelCallParams
  ): Promise<string> {
    const url = `${provider.baseUrl}/chat/completions`;

    const body: any = {
      model: modelName,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 4096,
    };

    if (params.responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000), // 120s timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  private findProvider(modelName: string): ProviderConfig | undefined {
    for (const provider of Object.values(this.providers)) {
      if (provider.models.some((m) => m.name === modelName)) {
        return provider;
      }
    }
    return undefined;
  }

  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for Chinese, 1 token ≈ 1 word for English
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }
}

// Singleton
export const modelGateway = new ModelGateway();
