import axios from 'axios';
import { ReportConfig, ReportTemplate, DataSource, Filter } from '../types/report';

const API_BASE_URL = '/api/reports';

interface PreviewData {
  data: Record<string, unknown>;
  structure: ReportConfig['structure'];
}

interface FormulaData {
  [key: string]: string | number | boolean | null;
}

export const reportService = {
  // Template Management
  async createTemplate(config: ReportConfig): Promise<ReportTemplate> {
    const response = await axios.post(`${API_BASE_URL}/templates`, config);
    return response.data;
  },

  async getTemplate(id: string): Promise<ReportTemplate> {
    const response = await axios.get(`${API_BASE_URL}/templates/${id}`);
    return response.data;
  },

  async updateTemplate(id: string, config: ReportConfig): Promise<ReportTemplate> {
    const response = await axios.put(`${API_BASE_URL}/templates/${id}`, config);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/templates/${id}`);
  },

  async listTemplates(): Promise<ReportTemplate[]> {
    const response = await axios.get(`${API_BASE_URL}/templates`);
    return response.data;
  },

  // Data Source Management
  async testDataSource(dataSource: DataSource): Promise<boolean> {
    const response = await axios.post(`${API_BASE_URL}/datasources/test`, dataSource);
    return response.data.success;
  },

  async getDataSourceFields(dataSource: DataSource): Promise<string[]> {
    const response = await axios.post(`${API_BASE_URL}/datasources/fields`, dataSource);
    return response.data.fields;
  },

  // Report Generation
  async generateReport(templateId: string, filters: Filter[]): Promise<Blob> {
    const response = await axios.post(
      `${API_BASE_URL}/generate/${templateId}`,
      { filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async previewReport(templateId: string, filters: Filter[]): Promise<PreviewData> {
    const response = await axios.post(`${API_BASE_URL}/preview/${templateId}`, { filters });
    return response.data;
  },

  // Formula Management
  async validateFormula(formula: string): Promise<boolean> {
    const response = await axios.post(`${API_BASE_URL}/formulas/validate`, { formula });
    return response.data.valid;
  },

  async evaluateFormula(formula: string, data: FormulaData): Promise<unknown> {
    const response = await axios.post(`${API_BASE_URL}/formulas/evaluate`, { formula, data });
    return response.data.result;
  },
};

export default reportService; 