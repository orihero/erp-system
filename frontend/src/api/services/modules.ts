import api from '../config';

export interface Module {
  id: string;
  name: string;
  icon_name: string;
  created_at: string;
  updated_at: string;
  is_enabled?: boolean;
}

export const modulesApi = {
  // Get all available modules
  getAllModules: () => 
    api.get<Module[]>('/api/modules'),

  // Get modules for a specific company
  getCompanyModules: (companyId: string) => 
    api.get<Module[]>(`/api/modules/company/${companyId}`),

  // Toggle module for a company
  toggleModule: (companyId: string, moduleId: string) => 
    api.post<{ message: string; is_enabled: boolean }>(`/api/modules/company/${companyId}/toggle/${moduleId}`)
}; 