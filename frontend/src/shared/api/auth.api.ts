import { apiClient } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, password }),

  me: () => apiClient.get('/api/auth/me'),
};
