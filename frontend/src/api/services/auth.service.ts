import api from '../config';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type User = {
  id: number;
  email: string;
  role: string;
  company_id: number;
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/users/login', credentials);
    return data;
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