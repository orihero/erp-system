import api from '../config';

export interface CascadingConfig {
  enabled: boolean;
  dependentFields: CascadingField[];
}

export interface CascadingField {
  fieldName: string;
  directoryId: string;
  displayName: string;
  required: boolean;
  dependsOn?: string;
}

export interface FilteredRecord {
  id: string;
  name: string;
  value: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CascadingDirectory {
  id: string;
  name: string;
  icon_name: string;
  directory_type: string;
  metadata: Record<string, unknown>;
}

export interface CascadingSelection {
  fieldName: string;
  value: string;
  parentField?: string;
  parentValue?: string;
}

export interface ValidationResult {
  fieldName: string;
  value: string;
  isValid: boolean;
  message: string;
}

export interface ValidationResponse {
  isValid: boolean;
  results: ValidationResult[];
}

export interface SaveCascadingValuesRequest {
  companyDirectoryId: string;
  parentFieldId: string;
  parentValue: string;
  cascadingSelections: {
    fieldName: string;
    value: string;
    displayName: string;
  }[];
}

export interface CascadingValuesResponse {
  parentField: {
    id: string;
    value: string;
    metadata: Record<string, unknown>;
  };
  dependentValues: Array<{
    id: string;
    value: string;
    displayName: string;
    metadata: Record<string, unknown>;
  }>;
  cascadingConfig: CascadingConfig;
}

// Add new interface for storing cascading values
export interface CascadingValueStorage {
  parentFieldId: string;
  parentValue: string;
  cascadingSelections: CascadingSelection[];
  metadata?: Record<string, unknown>;
}

export const cascadingApi = {
  // Get cascading configuration for a specific field value
  getCascadingConfig: (directoryId: string, fieldId: string, value: string) =>
    api.get<{ success: boolean; data: CascadingConfig }>('/api/cascading/config', {
      params: { directoryId, fieldId, value }
    }),

  // Get filtered directory records based on parent field value
  getFilteredRecords: (directoryId: string, parentField?: string, parentValue?: string) =>
    api.get<{ success: boolean; data: FilteredRecord[] }>('/api/cascading/filtered-records', {
      params: { directoryId, parentField, parentValue }
    }),

  // Get all cascading directories
  getCascadingDirectories: () =>
    api.get<{ success: boolean; data: CascadingDirectory[] }>('/api/cascading/directories'),

  // Update cascading configuration for a directory record
  updateCascadingConfig: (recordId: string, cascadingConfig: CascadingConfig) =>
    api.put<{ success: boolean; data: Record<string, unknown>; message: string }>(`/api/cascading/config/${recordId}`, {
      cascadingConfig
    }),

  // Validate cascading selection
  validateCascadingSelection: (selections: CascadingSelection[]) =>
    api.post<{ success: boolean; data: ValidationResponse }>('/api/cascading/validate', {
      selections
    }),

  // Save cascading field values
  saveCascadingValues: (request: SaveCascadingValuesRequest) =>
    api.post<{ success: boolean; data: Record<string, unknown>; message: string }>('/api/cascading/save-values', request),

  // Get cascading field values for a record
  getCascadingValues: (recordId: string) =>
    api.get<{ success: boolean; data: CascadingValuesResponse }>(`/api/cascading/values/${recordId}`),

  // Store cascading values for a directory record
  storeCascadingValues: (companyDirectoryId: string, cascadingData: CascadingValueStorage) =>
    api.post<{ success: boolean; data: Record<string, unknown>; message: string }>('/api/cascading/store-values', {
      companyDirectoryId,
      ...cascadingData
    }),

  // Get cascading values for a directory record
  getCascadingValuesForRecord: (recordId: string) =>
    api.get<{ success: boolean; data: CascadingValueStorage }>(`/api/cascading/record-values/${recordId}`)
}; 