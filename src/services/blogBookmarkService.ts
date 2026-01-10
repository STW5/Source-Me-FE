import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';
import { BlogPostListItem } from '@/types/blog';
import { PageResponse } from '@/types/common';

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

export const blogBookmarkService = {
  // Toggle bookmark (add/remove)
  async toggleBookmark(postId: string, userId: number): Promise<{ bookmarked: boolean }> {
    const response = await blogApi.post<ApiResponse<{ bookmarked: boolean }>>(
      `/blog/posts/${postId}/bookmark`,
      null,
      { params: { userId } }
    );
    return response.data.data;
  },

  // Check if user bookmarked the post
  async checkBookmarkStatus(postId: string, userId: number): Promise<{ bookmarked: boolean }> {
    const response = await blogApi.get<ApiResponse<{ bookmarked: boolean }>>(
      `/blog/posts/${postId}/bookmark/status`,
      { params: { userId } }
    );
    return response.data.data;
  },

  // Get user's bookmarked posts
  async getBookmarkedPosts(userId: number, page: number = 0, size: number = 10): Promise<PageResponse<BlogPostListItem>> {
    const response = await blogApi.get<ApiResponse<PageResponse<BlogPostListItem>>>(
      '/blog/bookmarks',
      { params: { userId, page, size } }
    );
    return response.data.data;
  },
};
