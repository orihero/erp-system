import api from '../config';
import type { NavigationResponse } from './types';

export interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    role: string;
    status: string;
    company_id: string;
    company?: {
      name?: string;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const usersService = {
  getUsers: async (params: UsersParams = {}): Promise<UsersResponse> => {
    const { data } = await api.get<UsersResponse>('/api/users', { params });
    return data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
  editUser: async (id: string, data: Partial<{ email: string; firstname: string; lastname: string; role: string; status: string; company_id: string; }>): Promise<UsersResponse['users'][0]> => {
    const response = await api.put<UsersResponse['users'][0]>(`/api/users/${id}`, data);
    return response.data;
  },
  getNavigation: async (): Promise<NavigationResponse> => {
    const { data } = await api.get<NavigationResponse>('/api/users/navigation');
    return data;
  }
}; 