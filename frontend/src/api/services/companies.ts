import api from '../config';

export interface Company {
  id: string;
  name: string;
  email: string;
  employee_count: number;
  status: string;
  logo?: string;
  address?: string;
  description?: string;
  website?: string;
  phone?: string;
  tax_id?: string;
  registration_number?: string;
  industry?: string;
  founded_year?: number;
  contacts?: Record<string, string>;
}

export interface CompaniesResponse {
  companies: Company[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const companiesApi = {
  getCompanies: (params?: { page?: number; limit?: number }) =>
    api.get<CompaniesResponse>('/api/admin/companies', { params }),
  addCompany: (data: Omit<Company, 'id'>) => api.post<Company>('/api/admin/companies', data),
  editCompany: (id: string, data: Partial<Company>) => api.put<Company>(`/api/admin/companies/${id}`, data),
  deleteCompany: (id: string) => api.delete(`/api/admin/companies/${id}`),
  getCompanyEmployees: (companyId: string, params?: { page?: number; limit?: number; search?: string }) =>
    api.get(`/api/admin/companies/${companyId}/employees`, { params }),
}; 