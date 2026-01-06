import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';
import { Tag, TagCreateRequest, TagUpdateRequest } from '@/types/tag';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authToken.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken.remove();
    }
    return Promise.reject(error);
  }
);

export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    const response = await api.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data;
  },

  async getTag(id: number): Promise<Tag> {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  },

  async createTag(data: TagCreateRequest): Promise<Tag> {
    const response = await api.post<ApiResponse<Tag>>('/tags', data);
    return response.data.data;
  },

  async updateTag(id: number, data: TagUpdateRequest): Promise<Tag> {
    const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, data);
    return response.data.data;
  },

  async deleteTag(id: number): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
