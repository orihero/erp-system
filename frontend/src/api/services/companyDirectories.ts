import api from '../config';

export interface CompanyDirectoryResponse {
  id: string;
  company_id: string;
  directory_id: string;
  module_id: string;
  created_at: string;
  updated_at: string;
  directory: {
    id: string;
    name: string;
    description: string;
    icon_name?: string;
  };
}

export const companyDirectoriesApi = {
  getAll: (companyId?: string, moduleId?: string) =>
    api.get<CompanyDirectoryResponse[]>(`/api/company-directories?company_id=${companyId}&module_id=${moduleId}`),

  create: (data: {
    company_id: string;
    module_id: string;
    directory_id: string;
  }) =>
    api.post<CompanyDirectoryResponse>('/api/company-directories', data),

  bulkBind: (data: {
    company_id: string;
    module_id: string;
    directory_ids: string[];
  }) =>
    api.post<CompanyDirectoryResponse[]>('/api/company-directories/bulk-bind', data),

  delete: (id: string) =>
    api.delete(`/api/company-directories/${id}`)
}; 