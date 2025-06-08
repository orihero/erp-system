import api from "@/api/config";

export interface Module {
  id: string;
  name: string;
  icon_name: string;
  is_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export const modulesApi = {
  getAll: () => api.get<Module[]>("/api/modules"),
  getById: (id: string) => api.get<Module>(`/api/modules/${id}`),
  getCompanyModules: (companyId: string) =>
    api.get<Module[]>(`/api/modules/company/${companyId}`),
  toggleModule: (companyId: string, moduleId: string) =>
    api.post<{ message: string; is_enabled: boolean }>(
      `/api/modules/company/${companyId}/toggle/${moduleId}`
    ),
  update: (id: string, data: Partial<Module>) =>
    api.put<Module>(`/api/modules/${id}`, data),
  delete: (id: string) => api.delete(`/api/modules/${id}`),
};
