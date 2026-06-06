export interface StrategyCard {
  id: string;
  taskId: string;
  priority: string;
  title: string;
  platform?: string;
  cardJson: string;
  status: string;
}

export interface ProductionCard {
  id: string;
  taskId: string;
  strategyCardId?: string;
  platform: string;
  cardJson: string;
  status: string;
}

export interface StrategyCardParsed {
  cardId: string;
  priority: string;
  title: string;
  contentOpportunity: string;
  commentEvidence: string[];
  userPainPoint: string;
  userBarrier: string;
  coreJudgment: string;
  suggestedPlatform: string;
  contentFormat: string;
  suggestedGoal: string;
  estimatedValue: string;
  riskWarning: string;
  nextAction: string;
}
