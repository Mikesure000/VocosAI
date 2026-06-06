import { apiClient } from './client';
import type { Project, ProjectCreateInput } from '../types/project';

export const projectApi = {
  list: () => apiClient.get<Project[]>('/api/projects'),

  create: (data: ProjectCreateInput) =>
    apiClient.post<Project>('/api/projects', data),

  get: (id: string) => apiClient.get<Project>(`/api/projects/${id}`),

  archive: (id: string) => apiClient.delete(`/api/projects/${id}`),
};
