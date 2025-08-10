import { ReportTemplate, TemplateBinding } from '../../types/reportTemplate';
import { WizardStepData, WizardStepValidation } from '../../types/wizard';
import { DataSource } from '../../types/report';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ReportTemplateAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async listTemplates(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    companyId?: string;
  } = {}): Promise<{
    templates: ReportTemplate[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/report-templates?${queryParams}`);
  }

  async getTemplate(id: string): Promise<ReportTemplate> {
    return this.request(`/report-templates/${id}`);
  }

  async createTemplate(templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return this.request('/report-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateTemplate(id: string, templateData: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return this.request(`/report-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteTemplate(id: string): Promise<{ message: string }> {
    return this.request(`/report-templates/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneTemplate(id: string): Promise<ReportTemplate> {
    return this.request(`/report-templates/${id}/clone`, {
      method: 'POST',
    });
  }

  async getTemplateVersions(id: string): Promise<unknown[]> {
    return this.request(`/report-templates/${id}/versions`);
  }

  async restoreVersion(id: string, version: number): Promise<ReportTemplate> {
    return this.request(`/report-templates/${id}/versions/${version}/restore`, {
      method: 'POST',
    });
  }

  // Binding management
  async getTemplateBindings(id: string): Promise<TemplateBinding[]> {
    return this.request(`/report-templates/${id}/bindings`);
  }

  async createBinding(id: string, bindingData: Partial<TemplateBinding>): Promise<TemplateBinding> {
    return this.request(`/report-templates/${id}/bindings`, {
      method: 'POST',
      body: JSON.stringify(bindingData),
    });
  }

  async updateBinding(id: string, bindingId: string, bindingData: Partial<TemplateBinding>): Promise<TemplateBinding> {
    return this.request(`/report-templates/${id}/bindings/${bindingId}`, {
      method: 'PUT',
      body: JSON.stringify(bindingData),
    });
  }

  async deleteBinding(id: string, bindingId: string): Promise<{ message: string }> {
    return this.request(`/report-templates/${id}/bindings/${bindingId}`, {
      method: 'DELETE',
    });
  }

  // Wizard support
  async getCategories(): Promise<Array<{ id: string; name: string; description: string }>> {
    return this.request('/report-templates/wizard/categories');
  }

  async validateWizardStep(stepId: string, stepData: WizardStepData, allWizardData: Record<string, WizardStepData>): Promise<WizardStepValidation> {
    return this.request('/report-templates/wizard/validate-step', {
      method: 'POST',
      body: JSON.stringify({ stepId, stepData, allWizardData }),
    });
  }

  async previewTemplate(wizardData: Record<string, WizardStepData>): Promise<Record<string, unknown>> {
    return this.request('/report-templates/wizard/preview', {
      method: 'POST',
      body: JSON.stringify(wizardData),
    });
  }

  // Data source endpoints
  async getDataSources(): Promise<DataSource[]> {
    return this.request('/report-templates/data-sources');
  }

  async getDataSourceSchema(id: string): Promise<Record<string, unknown>> {
    return this.request(`/report-templates/data-sources/${id}/schema`);
  }

  async testDataSource(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/report-templates/data-sources/${id}/test`, {
      method: 'POST',
    });
  }

  async validateQuery(query: string, dataSourceId: string): Promise<{ isValid: boolean; errors: string[] }> {
    return this.request('/report-templates/data-sources/validate-query', {
      method: 'POST',
      body: JSON.stringify({ query, dataSourceId }),
    });
  }

  // Report generation
  async generateReport(id: string, parameters: Record<string, unknown> = {}, format: string = 'pdf'): Promise<{
    executionId: string;
    status: string;
    message: string;
  }> {
    return this.request(`/report-templates/${id}/generate`, {
      method: 'POST',
      body: JSON.stringify({ parameters, format }),
    });
  }

  async getExecutionHistory(params: {
    page?: number;
    limit?: number;
    templateId?: string;
  } = {}): Promise<unknown> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/report-templates/executions?${queryParams}`);
  }

  async downloadReport(executionId: string): Promise<Blob> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/report-templates/executions/${executionId}/download`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.blob();
  }
}

export const reportTemplateAPI = new ReportTemplateAPI(); 