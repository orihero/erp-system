import api from '../config';

export interface ExcelReportTemplate {
  id: string;
  company_id: string;
  name: string;
  start_date: string;
  end_date: string;
  selected_directories: string[];
  selected_modules: string[];
  status: 'draft' | 'configured' | 'completed';
  uploaded_file_path?: string;
  uploaded_file_name?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  metadata?: Record<string, unknown>;
  created_by: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  uploader?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface CreateDraftRequest {
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  selectedDirectories: string[];
  selectedModules: string[];
}

export interface UpdateDraftRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  selectedDirectories?: string[];
  selectedModules?: string[];
  status?: 'draft' | 'configured' | 'completed';
  metadata?: Record<string, unknown>;
}

export interface TemplatesResponse {
  success: boolean;
  templates: ExcelReportTemplate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TemplateResponse {
  success: boolean;
  data: ExcelReportTemplate;
}

export const excelReportTemplateAPI = {
  // Create a new Excel report template
  createTemplate: (data: CreateDraftRequest) =>
    api.post<TemplateResponse>('/api/excel-report-templates', data),

  // Get all templates for a company
  getTemplates: (companyId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    moduleId?: string;
  } = {}) =>
    api.get<TemplatesResponse>(`/api/excel-report-templates/company/${companyId}`, { params }),

  // Get a specific template
  getTemplate: (id: string) =>
    api.get<TemplateResponse>(`/api/excel-report-templates/${id}`),

  // Update a template
  updateTemplate: (id: string, data: UpdateDraftRequest) =>
    api.put<TemplateResponse>(`/api/excel-report-templates/${id}`, data),

  // Delete a template
  deleteTemplate: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/excel-report-templates/${id}`),

  // Generate and download Excel file
  generateExcel: (id: string, data: {
    startDate: string;
    endDate: string;
    selectedDirectories: string[];
  }) =>
    api.post<Blob>(`/api/excel-report-templates/${id}/generate-excel`, data, {
      responseType: 'blob',
    }),

  // Upload configured Excel file
  uploadConfiguredFile: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<TemplateResponse>(`/api/excel-report-templates/${id}/upload-configured`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download configured file
  downloadConfiguredFile: (id: string) =>
    api.get<Blob>(`/api/excel-report-templates/${id}/download-configured`, {
      responseType: 'blob',
    }),
};
