import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';

// Create a separate axios instance for blog API
const blogApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header to all requests if token exists
blogApi.interceptors.request.use(
  (config) => {
    const token = authToken.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses by clearing token
blogApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken.remove();
    }
    return Promise.reject(error);
  }
);

export const blogLikeService = {
  // Toggle like (add/remove)
  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const response = await blogApi.post<ApiResponse<{ liked: boolean }>>(
      `/blog/posts/${postId}/like`
    );
    return response.data.data;
  },

  // Check if user liked the post
  async checkLikeStatus(postId: string): Promise<{ liked: boolean }> {
    const response = await blogApi.get<ApiResponse<{ liked: boolean }>>(
      `/blog/posts/${postId}/like/status`
    );
    return response.data.data;
  },

  // Get like count for a post
  async getLikeCount(postId: string): Promise<{ count: number }> {
    const response = await blogApi.get<ApiResponse<{ count: number }>>(
      `/blog/posts/${postId}/like/count`
    );
    return response.data.data;
  },
};
