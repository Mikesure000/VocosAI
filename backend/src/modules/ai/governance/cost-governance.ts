/**
 * 成本治理模块
 * 基于 PRD 第 15 章：月度配额、单任务上限、降级/阻断策略
 */

import { prisma } from '../../../config/prisma.js';

interface CostLimit {
  monthlyQuota: number;    // 月度 token 配额
  taskCostLimit: number;   // 单任务成本上限（元）
  warningThreshold: number; // 预警阈值（0-1）
}

export class CostGovernance {
  private limits: CostLimit;

  constructor() {
    this.limits = {
      monthlyQuota: parseInt(process.env.VOCOS_MONTHLY_QUOTA || '1000000', 10),
      taskCostLimit: parseFloat(process.env.VOCOS_TASK_COST_LIMIT || '12.00'),
      warningThreshold: 0.8,
    };
  }

  /**
   * 检查任务是否可以执行
   */
  async checkTaskCanRun(teamId: string, taskId: string): Promise<{ allowed: boolean; reason?: string }> {
    // 1. 检查月度配额
    const monthlyUsage = await this.getMonthlyUsage(teamId);
    if (monthlyUsage >= this.limits.monthlyQuota) {
      return { allowed: false, reason: '月度配额已用完' };
    }

    // 2. 检查月度预警
    if (monthlyUsage >= this.limits.monthlyQuota * this.limits.warningThreshold) {
      console.warn(`[CostGovernance] Team ${teamId} monthly usage at ${Math.round(monthlyUsage / this.limits.monthlyQuota * 100)}%`);
    }

    // 3. 检查任务成本
    const taskCost = await this.getTaskCost(taskId);
    if (taskCost >= this.limits.taskCostLimit) {
      return { allowed: false, reason: `任务成本已达上限 ¥${this.limits.taskCostLimit}` };
    }

    return { allowed: true };
  }

  /**
   * 获取月度使用量（tokens）
   */
  async getMonthlyUsage(teamId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await prisma.costUsage.aggregate({
      where: {
        teamId,
        usageDate: { gte: startOfMonth },
      },
      _sum: { tokenCount: true },
    });

    return result._sum.tokenCount || 0;
  }

  /**
   * 获取任务累计成本
   */
  async getTaskCost(taskId: string): Promise<number> {
    const result = await prisma.costUsage.aggregate({
      where: { taskId },
      _sum: { costAmount: true },
    });
    return result._sum.costAmount || 0;
  }

  /**
   * 获取成本汇总
   */
  async getCostSummary(teamId?: string) {
    const where: any = {};
    if (teamId) where.teamId = teamId;

    const [total, byTeam, byModel, byAgent] = await Promise.all([
      prisma.costUsage.aggregate({ where, _sum: { costAmount: true, tokenCount: true } }),
      prisma.costUsage.groupBy({
        by: ['teamId'],
        where,
        _sum: { costAmount: true, tokenCount: true },
      }),
      prisma.aiRun.groupBy({
        by: ['modelName'],
        where: { status: 'success' },
        _sum: { actualCost: true, totalTokenCount: true },
      }),
      prisma.aiRun.groupBy({
        by: ['agentName'],
        where: { status: 'success' },
        _sum: { actualCost: true, totalTokenCount: true },
      }),
    ]);

    // Daily costs for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyCosts = await prisma.costUsage.groupBy({
      by: ['usageDate'],
      where: { ...where, usageDate: { gte: thirtyDaysAgo } },
      _sum: { costAmount: true },
      orderBy: { usageDate: 'asc' },
    });

    return {
      totalCost: total._sum.costAmount || 0,
      totalTokens: total._sum.tokenCount || 0,
      byTeam: byTeam.map((t) => ({ teamId: t.teamId, cost: t._sum.costAmount || 0, tokens: t._sum.tokenCount || 0 })),
      byModel: byModel.map((m) => ({ modelName: m.modelName, cost: m._sum.actualCost || 0, tokens: m._sum.totalTokenCount || 0 })),
      byAgent: byAgent.map((a) => ({ agentName: a.agentName, cost: a._sum.actualCost || 0, tokens: a._sum.totalTokenCount || 0 })),
      dailyCosts: dailyCosts.map((d) => ({ date: d.usageDate.toISOString().slice(0, 10), cost: d._sum.costAmount || 0 })),
    };
  }

  /**
   * 决定模型降级策略
   */
  getDegradationStrategy(monthlyUsagePct: number): 'none' | 'cost_optimized' | 'severely_restricted' {
    if (monthlyUsagePct < 0.8) return 'none';
    if (monthlyUsagePct < 0.95) return 'cost_optimized';
    return 'severely_restricted';
  }
}

export const costGovernance = new CostGovernance();
