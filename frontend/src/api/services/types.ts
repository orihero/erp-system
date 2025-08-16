export interface Module {
  id: string;
  name: string;
  icon_name: string;
  created_at: string;
  updated_at: string;
  is_enabled?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  type?: 'read' | 'write' | 'manage';
  module_id?: string;
  directory_id?: string;
  effective_from?: string;
  effective_until?: string;
  constraint_data?: unknown;
}

export interface Directory {
  id: string;
  name: string;
  icon_name: string;
  directory_type: 'Module' | 'Company' | 'System';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface NavigationModule extends Module {
  directories: Directory[];
}

export interface NavigationResponse {
  modules: NavigationModule[];
  companyDirectories: Directory[];
  systemDirectories: Directory[];
  hasExcelReportAccess?: boolean;
}

export interface User {
  id: string;
  email: string;
  role?: string;
  roles: Role[];
  company_id: string;
  firstname?: string;
  lastname?: string;
  company?: {
    id: string;
    name: string;
  };
} 