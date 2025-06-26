import api from '../config';
import { User, Role, NavigationItem } from './types';

export type LoginCredentials = {
  email: string;
  password: string;
};

// Backend returns a flat object: user fields + roles + token
export type LoginResponse = User & {
  token: string;
  roles: Role[];
  permissions?: string[];
  navigation?: NavigationItem[];
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/users/login', credentials);
      console.log('Auth Service - Login response:', response.data);
      console.log('Auth Service - User roles:', response.data.roles);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.permissions) {
          localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Auth Service - Login error:', error);
      throw error;
    }
  }

  getUserPermissions(): string[] {
    try {
      const permissions = localStorage.getItem('permissions');
      return permissions ? JSON.parse(permissions) : [];
    } catch (error) {
      console.error('Error parsing permissions:', error);
      return [];
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
  }

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/api/users/profile');
    return data;
  }

  async register(userData: {
    email: string;
    password: string;
    company_name: string;
    employee_count: number;
  }): Promise<User> {
    const { data } = await api.post<User>('/api/users/register', userData);
    return data;
  }
}

export const authService = new AuthService(); 