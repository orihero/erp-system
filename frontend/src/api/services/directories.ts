import api from '../config';

export interface DirectoryEntry {
  id: string;
  directory_type_id: string;
  company_id: string;
  values: Array<{
    attribute_id: string;
    value: string | number | boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Directory {
  id: string;
  name: string;
  icon_name: string;
  directory_type: string;
  created_at: string;
  updated_at: string;
  is_enabled?: boolean;
  fields?: DirectoryField[];
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export interface DirectoryField {
  id: string;
  directory_id: string;
  name: string;
  type: string;
  required: boolean;
  relation_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    [key: string]: string | number | boolean;
  };
}

export const directoriesApi = {
  // Get all directories
  getAll: () => 
    api.get<Directory[]>('/api/directories'),

  // Get directory fields
  getDirectoryFields: (directoryId: string) => 
    api.get<DirectoryField[]>(`/api/directories/${directoryId}/fields`),

  // Create a new directory
  createDirectory: (data: Omit<Directory, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Directory>('/api/directories', data),

  // Update a directory
  updateDirectory: (id: string, data: Partial<Directory>) => 
    api.put<Directory>(`/api/directories/${id}`, data),

  // Delete a directory
  deleteDirectory: (id: string) => 
    api.delete(`/api/directories/${id}`),

  // Get directory entries with pagination and filtering
  getDirectoryEntries: (directoryTypeId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, string | number | boolean>;
  }) => 
    api.get<{
      entries: DirectoryEntry[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      };
    }>(`/api/directory-records/directory/${directoryTypeId}`, { params }),

  // Create a new directory entry
  createDirectoryEntry: (directoryTypeId: string, values: Array<{
    attribute_id: string;
    value: string | number | boolean;
  }>) => 
    api.post<DirectoryEntry>(`/api/directory-records`, { company_directory_id: directoryTypeId, values }),

  // Update a directory entry
  updateDirectoryEntry: (directoryTypeId: string, entryId: string, values: Array<{
    attribute_id: string;
    value: string | number | boolean;
  }>) => 
    api.put<DirectoryEntry>(`/api/directory-records/${entryId}`, { company_directory_id: directoryTypeId, values }),

  // Delete a directory entry
  deleteDirectoryEntry: (directoryTypeId: string, entryId: string) => 
    api.delete(`/api/directory-records/${entryId}`),

  // Get full directory data, companyDirectory, and directoryRecords
  getFullDirectoryData: (directory_id: string, company_id: string, params?: URLSearchParams) =>
    api.get<{
      directory: Directory;
      companyDirectory: {
        id: string;
        company_id: string;
        directory_id: string;
        module_id: string;
        directory: Directory;
      };
      directoryRecords: DirectoryEntry[];
    }>(`/api/directory-records/full-data`, { 
      params: { 
        directory_id, 
        company_id,
        ...(params ? Object.fromEntries(params) : {})
      } 
    }),
};
