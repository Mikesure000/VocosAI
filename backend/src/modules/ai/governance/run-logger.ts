/**
 * AI Run Logger - AI 调用日志记录
 * 基于 PRD 第 14 章：每次模型调用写入 ai_runs
 */

import { prisma } from '../../../config/prisma.js';

interface RunLogEntry {
  teamId: string;
  projectId?: string;
  taskId?: string;
  agentCode: string;
  agentVersion?: string;
  promptId?: string;
  promptVersion?: string;
  schemaId?: string;
  providerName: string;
  modelName: string;
  inputTokenCount: number;
  outputTokenCount: number;
  totalTokenCount: number;
  estimatedCost: number;
  actualCost: number;
  latencyMs: number;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  fallbackUsed: boolean;
  inputHash?: string;
  outputRaw?: string;
  outputJson?: string;
  schemaValidationStatus?: string;
  createdBy: string;
}

export class RunLogger {
  async log(entry: RunLogEntry) {
    try {
      await prisma.aiRun.create({
        data: {
          teamId: entry.teamId,
          projectId: entry.projectId,
          taskId: entry.taskId,
          agentName: entry.agentCode,
          agentVersion: entry.agentVersion || '1.0.0',
          promptId: entry.promptId,
          promptVersion: entry.promptVersion,
          schemaId: entry.schemaId,
          providerName: entry.providerName,
          modelName: entry.modelName,
          inputTokenCount: entry.inputTokenCount,
          outputTokenCount: entry.outputTokenCount,
          totalTokenCount: entry.totalTokenCount,
          estimatedCost: entry.estimatedCost,
          actualCost: entry.actualCost,
          latencyMs: entry.latencyMs,
          status: entry.status,
          errorCode: entry.errorCode,
          errorMessage: entry.errorMessage,
          retryCount: entry.retryCount,
          fallbackUsed: entry.fallbackUsed,
          inputHash: entry.inputHash,
          outputRaw: entry.outputRaw,
          outputJson: entry.outputJson,
          schemaValidationStatus: entry.schemaValidationStatus,
          createdBy: entry.createdBy,
        },
      });

      // Also record cost
      if (entry.actualCost > 0) {
        await prisma.costUsage.create({
          data: {
            teamId: entry.teamId,
            projectId: entry.projectId,
            taskId: entry.taskId,
            agentId: entry.agentCode,
            modelId: entry.modelName,
            costAmount: entry.actualCost,
            tokenCount: entry.totalTokenCount,
          },
        });
      }
    } catch (err) {
      console.error('[RunLogger] Failed to log AI run:', err);
    }
  }
}

export const runLogger = new RunLogger();
