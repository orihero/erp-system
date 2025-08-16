import { ReportTemplate, TemplateBinding } from '../../types/reportTemplate';
import { WizardStepData, WizardStepValidation } from '../../types/wizard';
import { DataSource } from '../../types/report';
import api from '../../api/config';

export const reportTemplateAPI = {

  // List templates
  listTemplates: (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    companyId?: string;
  } = {}) =>
    api.get<{
      templates: ReportTemplate[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/report-templates', { params }),

  // Get template by ID
  getTemplate: (id: string) =>
    api.get<ReportTemplate>(`/report-templates/${id}`),

  // Create template
  createTemplate: (templateData: Partial<ReportTemplate>) =>
    api.post<ReportTemplate>('/report-templates', templateData),

  // Update template
  updateTemplate: (id: string, templateData: Partial<ReportTemplate>) =>
    api.put<ReportTemplate>(`/report-templates/${id}`, templateData),

  // Delete template
  deleteTemplate: (id: string) =>
    api.delete<{ message: string }>(`/report-templates/${id}`),

  // Clone template
  cloneTemplate: (id: string) =>
    api.post<ReportTemplate>(`/report-templates/${id}/clone`),

  // Get template versions
  getTemplateVersions: (id: string) =>
    api.get<unknown[]>(`/report-templates/${id}/versions`),

  // Restore version
  restoreVersion: (id: string, version: number) =>
    api.post<ReportTemplate>(`/report-templates/${id}/versions/${version}/restore`),

  // Binding management
  getTemplateBindings: (id: string) =>
    api.get<TemplateBinding[]>(`/report-templates/${id}/bindings`),

  createBinding: (id: string, bindingData: Partial<TemplateBinding>) =>
    api.post<TemplateBinding>(`/report-templates/${id}/bindings`, bindingData),

  updateBinding: (id: string, bindingId: string, bindingData: Partial<TemplateBinding>) =>
    api.put<TemplateBinding>(`/report-templates/${id}/bindings/${bindingId}`, bindingData),

  deleteBinding: (id: string, bindingId: string) =>
    api.delete<{ message: string }>(`/report-templates/${id}/bindings/${bindingId}`),

  // Wizard support
  getCategories: () =>
    api.get<Array<{ id: string; name: string; description: string }>>('/report-templates/wizard/categories'),

  validateWizardStep: (stepId: string, stepData: WizardStepData, allWizardData: Record<string, WizardStepData>) =>
    api.post<WizardStepValidation>('/report-templates/wizard/validate-step', { stepId, stepData, allWizardData }),

  previewTemplate: (wizardData: Record<string, WizardStepData>) =>
    api.post<Record<string, unknown>>('/report-templates/wizard/preview', wizardData),

  // Data source endpoints
  getDataSources: () =>
    api.get<DataSource[]>('/report-templates/data-sources'),

  getDataSourceSchema: (id: string) =>
    api.get<Record<string, unknown>>(`/report-templates/data-sources/${id}/schema`),

  testDataSource: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/report-templates/data-sources/${id}/test`),

  validateQuery: (query: string, dataSourceId: string) =>
    api.post<{ isValid: boolean; errors: string[] }>('/report-templates/data-sources/validate-query', { query, dataSourceId }),

  // Report generation
  generateReport: (id: string, parameters: Record<string, unknown> = {}, format: string = 'pdf') =>
    api.post<{
      executionId: string;
      status: string;
      message: string;
    }>(`/report-templates/${id}/generate`, { parameters, format }),

  getExecutionHistory: (params: {
    page?: number;
    limit?: number;
    templateId?: string;
  } = {}) =>
    api.get<unknown>('/report-templates/executions', { params }),

  // Download report
  downloadReport: (executionId: string) =>
    api.get<Blob>(`/report-templates/executions/${executionId}/download`, {
      responseType: 'blob',
    }),
}; 