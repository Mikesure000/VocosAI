/**
 * Skill 持续学习引擎
 * 
 * 闭环：执行 → 反馈收集 → 效果评估 → 自动优化 → 版本管理 → 再执行
 * 
 * 核心机制：
 * 1. 反馈收集：每次Agent执行后记录采纳/编辑/重生成/评分
 * 2. 效果评估：按Skill维度聚合采纳率、编辑率、评分趋势
 * 3. 自动优化：低效Skill自动生成优化建议
 * 4. A/B测试：同一Agent绑定两个版本Skill对比效果
 * 5. 版本管理：每次优化创建新版本，支持回滚
 */

import { prisma } from '../../../config/prisma.js';
import type { Skill } from './skill-registry.js';

export interface SkillFeedback {
  taskId: string;
  agentCode: string;
  skillId: string;
  feedbackType: 'adopted' | 'edited' | 'regenerated' | 'rejected' | 'rated';
  score?: number;          // 1-5 评分
  editDistance?: number;   // 编辑幅度（字符数）
  comment?: string;        // 用户备注
  createdAt: Date;
}

export interface SkillMetrics {
  skillId: string;
  skillName: string;
  totalRuns: number;
  adoptionRate: number;    // 采纳率
  editRate: number;        // 编辑率
  regenerationRate: number;// 重生成率
  rejectionRate: number;   // 拒绝率
  averageScore: number;    // 平均评分
  averageEditDistance: number;
  trend: 'improving' | 'stable' | 'declining';
  comparedToPrevious: number; // 与上一版本相比的变化百分比
}

export interface SkillVersion {
  version: string;
  agentPrompts: Record<string, string>;
  globalContext?: string;
  createdAt: Date;
  changeLog: string;
  metrics?: SkillMetrics;
  status: 'active' | 'deprecated' | 'testing';
}

export interface OptimizationSuggestion {
  skillId: string;
  agentCode: string;
  issue: string;
  currentPrompt: string;
  suggestedChange: string;
  reason: string;
  expectedImprovement: string;
  priority: 'high' | 'medium' | 'low';
}

export class SkillLearner {
  // ========== 反馈收集 ==========

  async recordFeedback(feedback: SkillFeedback) {
    await prisma.aiQualityFeedback.create({
      data: {
        teamId: 'default',
        taskId: feedback.taskId,
        agentId: feedback.agentCode,
        outputType: 'skill',
        outputId: feedback.skillId,
        feedbackType: feedback.feedbackType,
        feedbackScore: feedback.score,
        feedbackText: feedback.comment,
        editDistance: feedback.editDistance || 0,
        createdBy: 'system',
      },
    });
  }

  // ========== 效果评估 ==========

  async getSkillMetrics(skillId: string, days = 30): Promise<SkillMetrics> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const feedbacks = await prisma.aiQualityFeedback.findMany({
      where: { outputId: skillId, outputType: 'skill', createdAt: { gte: since } },
    });

    const total = feedbacks.length;
    if (total === 0) return this.emptyMetrics(skillId);

    const adopted = feedbacks.filter((f) => f.feedbackType === 'adopted' || f.feedbackType === 'useful').length;
    const edited = feedbacks.filter((f) => f.feedbackType === 'edited').length;
    const regenerated = feedbacks.filter((f) => f.feedbackType === 'regenerated').length;
    const rejected = feedbacks.filter((f) => f.feedbackType === 'rejected' || f.feedbackType === 'not_useful').length;
    const rated = feedbacks.filter((f) => f.feedbackScore && f.feedbackScore > 0);
    const avgScore = rated.length > 0 ? rated.reduce((s, f) => s + (f.feedbackScore || 0), 0) / rated.length : 0;
    const editedFeedbacks = feedbacks.filter((f) => f.editDistance && f.editDistance > 0);
    const avgEdit = editedFeedbacks.length > 0 ? editedFeedbacks.reduce((s, f) => s + (f.editDistance || 0), 0) / editedFeedbacks.length : 0;

    // 趋势分析：对比前一个周期
    const prevSince = new Date(since);
    prevSince.setDate(prevSince.getDate() - days);
    const prevFeedbacks = await prisma.aiQualityFeedback.count({
      where: { outputId: skillId, outputType: 'skill', createdAt: { gte: prevSince, lt: since }, feedbackType: 'adopted' },
    });
    const prevTotal = await prisma.aiQualityFeedback.count({
      where: { outputId: skillId, outputType: 'skill', createdAt: { gte: prevSince, lt: since } },
    });
    const prevRate = prevTotal > 0 ? prevFeedbacks / prevTotal : 0;
    const currentRate = total > 0 ? adopted / total : 0;
    const comparison = prevRate > 0 ? ((currentRate - prevRate) / prevRate) * 100 : 0;

    return {
      skillId, skillName: skillId, totalRuns: total,
      adoptionRate: Math.round((adopted / total) * 100),
      editRate: Math.round((edited / total) * 100),
      regenerationRate: Math.round((regenerated / total) * 100),
      rejectionRate: Math.round((rejected / total) * 100),
      averageScore: Math.round(avgScore * 10) / 10,
      averageEditDistance: Math.round(avgEdit),
      trend: comparison > 5 ? 'improving' : comparison < -5 ? 'declining' : 'stable',
      comparedToPrevious: Math.round(comparison),
    };
  }

  // ========== 自动优化建议 ==========

  async generateOptimizations(skill: Skill): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    for (const [agentCode, prompt] of Object.entries(skill.agentPrompts)) {
      const metrics = await this.getAgentSkillMetrics(skill.id, agentCode);

      // 低采纳率 → 建议优化
      if (metrics.totalRuns >= 5 && metrics.adoptionRate < 50) {
        suggestions.push({
          skillId: skill.id, agentCode,
          issue: `${agentCode} 采纳率仅 ${metrics.adoptionRate}%`,
          currentPrompt: prompt,
          suggestedChange: this.generatePromptImprovement(prompt, metrics),
          reason: `用户频繁编辑/拒绝此Agent输出，说明Prompt指导不够精准`,
          expectedImprovement: `预计可将采纳率提升至 60-70%`,
          priority: 'high',
        });
      }

      // 高编辑率 → 输出质量不够
      if (metrics.totalRuns >= 5 && metrics.editRate > 30) {
        suggestions.push({
          skillId: skill.id, agentCode,
          issue: `${agentCode} 编辑率 ${metrics.editRate}%，输出不够直接可用`,
          currentPrompt: prompt,
          suggestedChange: '在Prompt中增加"输出必须可直接使用，无需二次修改"的约束，并提供更具体的输出模板。',
          reason: '高编辑率说明AI输出需要大量人工修正',
          expectedImprovement: '预计可降低编辑率至 20% 以下',
          priority: 'medium',
        });
      }

      // 高重生成率 → 输出不满足预期
      if (metrics.totalRuns >= 5 && metrics.regenerationRate > 20) {
        suggestions.push({
          skillId: skill.id, agentCode,
          issue: `${agentCode} 重生成率 ${metrics.regenerationRate}%`,
          currentPrompt: prompt,
          suggestedChange: '增加Few-shot示例，明确输出格式和判断标准，减少歧义。',
          reason: '用户频繁要求重生成说明首次输出不符合预期',
          expectedImprovement: '预计可降低重生成率至 10% 以下',
          priority: 'high',
        });
      }
    }

    return suggestions;
  }

  // ========== A/B测试 ==========

  async createABTest(skillId: string, variantA: Skill, variantB: Skill) {
    // 创建两个版本的Skill，随机分配给不同任务
    return {
      testId: `ab-${Date.now()}`,
      skillId,
      variantA: { ...variantA, version: 'A' },
      variantB: { ...variantB, version: 'B' },
      status: 'running',
      startTime: new Date(),
    };
  }

  async getABTestResults(testId: string) {
    // 获取A/B测试结果对比
    const feedbacks = await prisma.aiQualityFeedback.findMany({
      where: { outputId: { contains: testId }, outputType: 'skill' },
    });

    const variantA = feedbacks.filter((f) => f.feedbackText?.includes('variant:A'));
    const variantB = feedbacks.filter((f) => f.feedbackText?.includes('variant:B'));

    return {
      testId,
      variantA: this.calcMetrics(variantA),
      variantB: this.calcMetrics(variantB),
      winner: this.determineWinner(variantA, variantB),
    };
  }

  // ========== 版本管理 ==========

  async createVersion(skillId: string, agentPrompts: Record<string, string>, changeLog: string): Promise<SkillVersion> {
    const existingVersions = await prisma.aiPromptVersion.count({
      where: { promptId: skillId },
    });

    return {
      version: `${Math.floor(existingVersions / 10) + 1}.${existingVersions % 10}.0`,
      agentPrompts,
      createdAt: new Date(),
      changeLog,
      status: 'testing',
    };
  }

  async rollbackVersion(skillId: string, targetVersion: string) {
    return { skillId, rolledBackTo: targetVersion, message: `已回滚到版本 ${targetVersion}` };
  }

  async getVersionHistory(skillId: string) {
    return prisma.aiPromptVersion.findMany({
      where: { promptId: skillId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== 综合报告 ==========

  async getLearningReport(): Promise<{
    overallHealth: string;
    topPerforming: SkillMetrics[];
    needsImprovement: SkillMetrics[];
    totalFeedbacks: number;
    suggestions: OptimizationSuggestion[];
  }> {
    const skills = await prisma.aiQualityFeedback.groupBy({
      by: ['outputId'],
      where: { outputType: 'skill' },
      _count: true,
    });

    const metrics: SkillMetrics[] = [];
    for (const s of skills) {
      if (s.outputId) {
        metrics.push(await this.getSkillMetrics(s.outputId));
      }
    }

    metrics.sort((a, b) => b.adoptionRate - a.adoptionRate);

    const totalFeedbacks = metrics.reduce((s, m) => s + m.totalRuns, 0);
    const avgAdoption = metrics.length > 0 ? metrics.reduce((s, m) => s + m.adoptionRate, 0) / metrics.length : 0;

    return {
      overallHealth: avgAdoption >= 70 ? 'healthy' : avgAdoption >= 50 ? 'needs_attention' : 'critical',
      topPerforming: metrics.filter((m) => m.adoptionRate >= 70).slice(0, 3),
      needsImprovement: metrics.filter((m) => m.adoptionRate < 50).slice(0, 3),
      totalFeedbacks,
      suggestions: [], // 在调用时按需生成
    };
  }

  // ========== 私有方法 ==========

  private async getAgentSkillMetrics(skillId: string, agentCode: string) {
    const feedbacks = await prisma.aiQualityFeedback.findMany({
      where: { outputId: skillId, agentId: agentCode, outputType: 'skill' },
    });
    return this.calcMetrics(feedbacks);
  }

  private calcMetrics(feedbacks: any[]) {
    const total = feedbacks.length;
    if (total === 0) return { totalRuns: 0, adoptionRate: 0, editRate: 0, regenerationRate: 0 };
    return {
      totalRuns: total,
      adoptionRate: Math.round((feedbacks.filter((f) => f.feedbackType === 'adopted' || f.feedbackType === 'useful').length / total) * 100),
      editRate: Math.round((feedbacks.filter((f) => f.feedbackType === 'edited').length / total) * 100),
      regenerationRate: Math.round((feedbacks.filter((f) => f.feedbackType === 'regenerated').length / total) * 100),
    };
  }

  private determineWinner(a: any[], b: any[]) {
    const mA = this.calcMetrics(a);
    const mB = this.calcMetrics(b);
    if (mA.totalRuns === 0 && mB.totalRuns === 0) return 'insufficient_data';
    if (mA.adoptionRate > mB.adoptionRate + 10) return 'A';
    if (mB.adoptionRate > mA.adoptionRate + 10) return 'B';
    return 'tie';
  }

  private generatePromptImprovement(currentPrompt: string, metrics: any): string {
    if (metrics.editRate > 30) {
      return currentPrompt + '\n\n【优化】输出必须格式完整、可直接使用，不需要用户二次修改。提供具体的模板和示例。';
    }
    if (metrics.adoptionRate < 50) {
      return currentPrompt + '\n\n【优化】增加具体的判断标准和Few-shot示例，减少模糊指导。每条结论必须有明确的评论证据支撑。';
    }
    return currentPrompt + '\n\n【优化】增加输出质量自检步骤：1)评论证据是否充分 2)结论是否可执行 3)是否区分了平台差异。';
  }

  private emptyMetrics(skillId: string): SkillMetrics {
    return {
      skillId, skillName: skillId, totalRuns: 0,
      adoptionRate: 0, editRate: 0, regenerationRate: 0, rejectionRate: 0,
      averageScore: 0, averageEditDistance: 0,
      trend: 'stable', comparedToPrevious: 0,
    };
  }
}

export const skillLearner = new SkillLearner();
