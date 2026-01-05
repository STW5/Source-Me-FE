import api from '@/lib/api';
import { ApiResponse } from '@/types/profile';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    return response.data.data;
  },
};
