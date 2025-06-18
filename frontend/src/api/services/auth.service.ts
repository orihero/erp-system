import api from '../config';
import { User } from './types';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
  permissions?: string[];
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/users/login', credentials);
      console.log('Auth Service - Login response:', response.data);
      console.log('Auth Service - User roles:', response.data.user.roles);
      
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