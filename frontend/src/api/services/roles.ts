import api from '../config';

export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export const rolesApi = {
  getAll: () => api.get<UserRole[]>('/api/roles'),
}; 