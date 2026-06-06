export interface AiAgent {
  id: string;
  agentName: string;
  agentCode: string;
  agentVersion: string;
  description?: string;
  status: string;
  executionOrder: number;
  dependsOn?: string;
  canParallel: boolean;
}

export interface ModelProvider {
  id: string;
  providerName: string;
  baseUrl: string;
  status: string;
}

export interface ModelConfig {
  id: string;
  providerId: string;
  modelName: string;
  modelType: string;
  contextWindow: number;
  inputTokenPrice: number;
  outputTokenPrice: number;
  isActive: boolean;
}

export interface AiRun {
  id: string;
  taskId?: string;
  agentName?: string;
  modelName?: string;
  providerName?: string;
  inputTokenCount: number;
  outputTokenCount: number;
  totalTokenCount: number;
  actualCost: number;
  latencyMs: number;
  status: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export interface AiPrompt {
  id: string;
  agentId: string;
  promptName: string;
  currentVersionId?: string;
  status: string;
}

export interface AiPromptVersion {
  id: string;
  promptId: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  inputVariables?: string;
  status: string;
  changeLog?: string;
}

export interface CostSummary {
  totalCost: number;
  byTeam: { teamId: string; teamName: string; cost: number }[];
  byModel: { modelName: string; cost: number; tokenCount: number }[];
  byAgent: { agentCode: string; agentName: string; cost: number }[];
  dailyCosts: { date: string; cost: number }[];
}

export interface QualitySummary {
  totalRuns: number;
  successRate: number;
  adoptionRate: number;
  editRate: number;
  regenerationRate: number;
  jsonFailRate: number;
  averageLatency: number;
}
