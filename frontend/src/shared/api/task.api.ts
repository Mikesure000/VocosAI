import { apiClient } from './client';
import type { AnalysisTask, TaskCreateInput } from '../types/task';

export const taskApi = {
  list: (projectId?: string) =>
    apiClient.get<AnalysisTask[]>('/api/tasks', { params: { projectId } }),

  create: (data: any) =>
    apiClient.post<AnalysisTask>('/api/tasks', data),

  get: (taskId: string) =>
    apiClient.get<AnalysisTask>(`/api/tasks/${taskId}`),

  uploadFile: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/api/tasks/${taskId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirmMapping: (taskId: string, mapping: Record<string, string>) =>
    apiClient.post(`/api/tasks/${taskId}/confirm-mapping`, { mapping }),

  start: (taskId: string) =>
    apiClient.post(`/api/tasks/${taskId}/start`),

  getStatus: (taskId: string) =>
    apiClient.get(`/api/tasks/${taskId}/status`),

  getComments: (taskId: string, params?: any) =>
    apiClient.get(`/api/tasks/${taskId}/comments`, { params }),

  getSignalStats: (taskId: string) =>
    apiClient.get(`/api/tasks/${taskId}/signal-stats`),

  getInsights: (taskId: string) =>
    apiClient.get(`/api/tasks/${taskId}/insights`),

  getStrategyCards: (taskId: string) =>
    apiClient.get(`/api/tasks/${taskId}/strategy-cards`),

  getSignalDefinitions: () =>
    apiClient.get('/api/comment-signal-definitions'),
};
