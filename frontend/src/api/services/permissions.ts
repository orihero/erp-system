import api from '../config';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  type?: 'read' | 'write' | 'manage';
  module_id?: string;
  directory_id?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  effective_from?: string;
  effective_until?: string;
  constraint_data?: unknown;
}

export const permissionsApi = {
  getAll: () => api.get<Permission[]>('/api/permissions'),
  create: (data: Partial<Permission>) => api.post<Permission>('/api/permissions', data),
  update: (id: string, data: Partial<Permission>) => api.put<Permission>(`/api/permissions/${id}`, data),
  delete: (id: string) => api.delete(`/api/permissions/${id}`),
  assignToRole: (roleId: string, data: { permission_id: string; effective_from?: string; effective_until?: string; constraint_data?: unknown }) =>
    api.post<RolePermission>(`/api/permissions/roles/${roleId}/permissions`, data),
  removeFromRole: (roleId: string, permissionId: string) =>
    api.delete(`/api/permissions/roles/${roleId}/permissions/${permissionId}`),
  getRolePermissions: (roleId: string) =>
    api.get(`/api/permissions/roles/${roleId}/permissions`),
}; 