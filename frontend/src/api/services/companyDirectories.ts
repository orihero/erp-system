import api from '../config';
import { Directory } from './directories';

export interface CompanyDirectoryResponse {
  id: string;
  company_id: string;
  directory_id: string;
  created_at: string;
  updated_at: string;
  directory: {
    id: string;
    name: string;
    icon_name: string;
  };
  values: Array<{
    attribute_id: string;
    value: string;
  }>;
}

export interface CompanyDirectory extends Directory {
  is_enabled: boolean;
}

export const companyDirectoriesApi = {
  // Get all directories for a company
  getCompanyDirectories: (companyId: string) => 
    api.get<CompanyDirectoryResponse[]>(`/api/company-directories?company_id=${companyId}`),

  // Add a directory to a company
  addDirectoryToCompany: (companyId: string, directoryId: string, values: Array<{
    attribute_id: string;
    value: string;
  }>) => 
    api.post<CompanyDirectoryResponse>('/api/company-directories', {
      company_id: companyId,
      directory_id: directoryId,
      values
    }),

  // Remove a directory from a company
  removeDirectoryFromCompany: (directoryId: string) => 
    api.delete(`/api/company-directories/${directoryId}`)
}; 