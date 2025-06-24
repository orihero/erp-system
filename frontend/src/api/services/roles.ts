import api from '../config';

export interface UserRole {
  id: string;
  name: string;
  description: string;
  is_system?: boolean;
}

export const rolesApi = {
  getAll: () => api.get<UserRole[]>('/api/roles'),
  create: (data: { name: string; description?: string }) => api.post<UserRole>('/api/roles', data),
  update: (id: string, data: { name?: string; description?: string }) => api.put<UserRole>(`/api/roles/${id}`, data),
  delete: (id: string) => api.delete(`/api/roles/${id}`),
}; 