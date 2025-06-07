import api from '../config';
import { Directory } from './directories';

export const directoriesService = {
  getAll: () => api.get<Directory[]>('/api/directories'),
  create: (data: Omit<Directory, 'id' | 'created_at' | 'updated_at'>) => api.post<Directory>('/api/directories', data),
  update: (id: string, data: Partial<Directory>) => api.put<Directory>(`/api/directories/${id}`, data),
  delete: (id: string) => api.delete(`/api/directories/${id}`),
}; 