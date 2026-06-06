/**
 * 质量评估模块
 * 基于 PRD 第 16 章：采纳率、编辑率、重生成率、JSON失败率、模型失败率
 */

import { prisma } from '../../../config/prisma.js';

export class QualityGovernance {
  /**
   * 获取质量评估汇总
   */
  async getQualitySummary(teamId?: string) {
    const where: any = {};
    if (teamId) where.teamId = teamId;

    const [totalRuns, successRuns, feedbacks, strategyCards, productionCards] = await Promise.all([
      prisma.aiRun.count({ where }),
      prisma.aiRun.count({ where: { ...where, status: 'success' } }),
      prisma.aiQualityFeedback.findMany({ where }),
      prisma.strategyCard.findMany({ where: { status: { in: ['adopted', 'edited', 'rejected'] } } }),
      prisma.productionCard.findMany({ where: { status: { in: ['adopted', 'edited', 'rejected'] } } }),
    ]);

    const totalFeedback = feedbacks.length;
    const adoptedFeedback = feedbacks.filter((f) => f.feedbackType === 'adopted' || f.feedbackType === 'useful').length;
    const editedFeedback = feedbacks.filter((f) => f.feedbackType === 'edited').length;
    const regeneratedFeedback = feedbacks.filter((f) => f.feedbackType === 'regenerated').length;
    const uselessFeedback = feedbacks.filter((f) => f.feedbackType === 'not_useful').length;

    const totalStrategy = strategyCards.length;
    const adoptedStrategy = strategyCards.filter((c) => c.status === 'adopted').length;

    const totalProduction = productionCards.length;
    const adoptedProduction = productionCards.filter((c) => c.status === 'adopted').length;

    // Average latency
    const latencyResult = await prisma.aiRun.aggregate({
      where: { ...where, status: 'success' },
      _avg: { latencyMs: true },
    });

    // JSON validation fail rate
    const jsonFailed = await prisma.aiRun.count({
      where: { ...where, schemaValidationStatus: 'failed' },
    });

    return {
      totalRuns,
      successRate: totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0,
      adoptionRate: totalFeedback > 0 ? Math.round((adoptedFeedback / totalFeedback) * 100) : 0,
      editRate: totalFeedback > 0 ? Math.round((editedFeedback / totalFeedback) * 100) : 0,
      regenerationRate: totalFeedback > 0 ? Math.round((regeneratedFeedback / totalFeedback) * 100) : 0,
      uselessRate: totalFeedback > 0 ? Math.round((uselessFeedback / totalFeedback) * 100) : 0,
      jsonFailRate: totalRuns > 0 ? Math.round((jsonFailed / totalRuns) * 100) : 0,
      averageLatency: Math.round(latencyResult._avg.latencyMs || 0),
      strategyAdoption: { total: totalStrategy, adopted: adoptedStrategy },
      productionAdoption: { total: totalProduction, adopted: adoptedProduction },
    };
  }

  /**
   * 记录用户反馈
   */
  async recordFeedback(data: {
    teamId: string;
    projectId?: string;
    taskId?: string;
    agentId?: string;
    aiRunId?: string;
    outputType: string;
    outputId: string;
    feedbackType: string;
    feedbackScore?: number;
    feedbackText?: string;
    editDistance?: number;
    createdBy: string;
  }) {
    return prisma.aiQualityFeedback.create({ data });
  }
}

export const qualityGovernance = new QualityGovernance();
