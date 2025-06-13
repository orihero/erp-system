export interface Module {
  id: string;
  name: string;
  icon_name: string;
  created_at: string;
  updated_at: string;
  is_enabled?: boolean;
}

export interface User {
  id: number;
  email: string;
  role: string;
  roles: string[];
  company_id: number;
  firstname?: string;
  lastname?: string;
  company?: {
    id: number;
    name: string;
  };
} 