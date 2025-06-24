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
  type?: string;
  module_id?: string;
  directory_id?: string;
  effective_from?: string;
  effective_until?: string;
  constraint_data?: unknown;
}

export interface User {
  id: number;
  email: string;
  role: string;
  roles: Role[];
  company_id: number;
  firstname?: string;
  lastname?: string;
  company?: {
    id: number;
    name: string;
  };
} 