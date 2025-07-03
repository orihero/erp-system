import api from '../config';

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  // Add more fields as needed
}

export const dataSourcesApi = {
  // Get all data sources
  getAll: () => api.get<DataSource[]>('/api/data-sources'),

  // Get schema for a data source
  getSchema: (id: string) => api.get(`/api/data-sources/${id}/schema`),

  // Test connection for a data source
  testConnection: (id: string, config: Record<string, any>) =>
    api.post(`/api/data-sources/${id}/test`, config),
}; 