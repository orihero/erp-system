import api from '../config';
import { ReportTemplate } from '../../types/reportTemplate';

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

export interface CompanyTreeNode extends Company {
  children: CompanyTreeNode[];
  parent_company_id?: string | null;
}

export const companiesApi = {
  getCompanies: (params?: { page?: number; limit?: number }) =>
    api.get<CompaniesResponse>('/api/admin/companies', { params }),
  addCompany: (data: Omit<Company, 'id'>) => api.post<Company>('/api/admin/companies', data),
  editCompany: (id: string, data: Partial<Company>) => api.put<Company>(`/api/admin/companies/${id}`, data),
  deleteCompany: (id: string) => api.delete(`/api/admin/companies/${id}`),
  getCompanyEmployees: (companyId: string, params?: { page?: number; limit?: number; search?: string }) =>
    api.get(`/api/companies/${companyId}/employees`, { params }),
  editEmployee: (employeeId: string, data: Partial<{ firstname: string; lastname: string; email: string; status: string; roles: string[] }>) =>
    api.put(`/api/users/${employeeId}`, data),
  deleteEmployee: (employeeId: string) => api.delete(`/api/users/${employeeId}`),
  getCompanyReports: (companyId: string) =>
    api.get<ReportTemplate[]>(`/api/report-templates?companyId=${companyId}`),
  bindReportToCompany: (reportId: string, data: { companyId: string; [key: string]: unknown }) =>
    api.post(`/api/report-templates/${reportId}/bindings`, { ...data, bindingType: 'company' }),
  unbindReportFromCompany: (reportId: string, bindingId: string) =>
    api.delete(`/api/report-templates/${reportId}/bindings/${bindingId}`),
  getCompanyHierarchy: () => api.get<CompanyTreeNode[]>("/api/companies/hierarchy"),
}; 