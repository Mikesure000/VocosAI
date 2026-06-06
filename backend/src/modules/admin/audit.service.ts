/**
 * 审计日志模块
 * 基于 PRD 第 17 章：记录登录、操作、导出、删除、权限修改
 */

import { prisma } from '../../config/prisma.js';

export class AuditService {
  async log(data: {
    teamId?: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          teamId: data.teamId,
          userId: data.userId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadataJson: data.metadata ? JSON.stringify(data.metadata) : undefined,
        },
      });
    } catch (err) {
      console.error('[AuditService] Failed to log audit:', err);
    }
  }

  async list(params: {
    teamId?: string;
    userId?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (params.teamId) where.teamId = params.teamId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.resourceType) where.resourceType = params.resourceType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  // Common actions
  async logLogin(userId: string, teamId?: string, ip?: string, ua?: string) {
    return this.log({ userId, teamId, action: 'login', resourceType: 'auth', ipAddress: ip, userAgent: ua });
  }

  async logTaskCreate(userId: string, teamId: string, taskId: string, metadata?: any) {
    return this.log({ userId, teamId, action: 'create_task', resourceType: 'task', resourceId: taskId, metadata });
  }

  async logTaskStart(userId: string, teamId: string, taskId: string) {
    return this.log({ userId, teamId, action: 'start_task', resourceType: 'task', resourceId: taskId });
  }

  async logReportExport(userId: string, teamId: string, reportId: string, format: string) {
    return this.log({ userId, teamId, action: 'export_report', resourceType: 'report', resourceId: reportId, metadata: { format } });
  }

  async logReportShare(userId: string, teamId: string, reportId: string) {
    return this.log({ userId, teamId, action: 'share_report', resourceType: 'report', resourceId: reportId });
  }
}

export const auditService = new AuditService();
