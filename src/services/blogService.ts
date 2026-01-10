import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';
import { BlogPost, BlogPostListItem, BlogPostCreateRequest, BlogPostUpdateRequest } from '@/types/blog';
import { PageResponse, SearchRequest } from '@/types/common';

// Create a separate axios instance for blog API since it uses /api/blog instead of /api/v1
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

export const blogService = {
  // Get all published posts (public)
  async getPublishedPosts(tag?: string): Promise<BlogPostListItem[]> {
    const params = tag ? { tag } : {};
    const response = await blogApi.get<ApiResponse<BlogPostListItem[]>>('/blog/posts', { params });
    return response.data.data;
  },

  // Get all posts including drafts (admin)
  async getAllPosts(tag?: string): Promise<BlogPostListItem[]> {
    const params = tag ? { tag } : {};
    const response = await blogApi.get<ApiResponse<BlogPostListItem[]>>('/blog/admin/posts', { params });
    return response.data.data;
  },

  // Search published posts (public)
  async searchPublishedPosts(params: SearchRequest): Promise<PageResponse<BlogPostListItem>> {
    const response = await blogApi.get<ApiResponse<PageResponse<BlogPostListItem>>>('/blog/posts/search', { params });
    return response.data.data;
  },

  // Get post by ID
  async getPost(id: string): Promise<BlogPost> {
    const response = await blogApi.get<ApiResponse<BlogPost>>(`/blog/posts/${id}`);
    return response.data.data;
  },

  // Create post (requires auth)
  async createPost(data: BlogPostCreateRequest): Promise<BlogPost> {
    const response = await blogApi.post<ApiResponse<BlogPost>>('/blog/posts', data);
    return response.data.data;
  },

  // Update post (requires auth)
  async updatePost(id: string, data: BlogPostUpdateRequest): Promise<BlogPost> {
    const response = await blogApi.put<ApiResponse<BlogPost>>(`/blog/posts/${id}`, data);
    return response.data.data;
  },

  // Delete post (requires auth)
  async deletePost(id: string): Promise<void> {
    await blogApi.delete(`/blog/posts/${id}`);
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    await blogApi.post(`/blog/posts/${id}/view`);
  },

  // Get popular posts (by view count)
  async getPopularPosts(page: number = 0, size: number = 10): Promise<PageResponse<BlogPostListItem>> {
    const response = await blogApi.get<ApiResponse<PageResponse<BlogPostListItem>>>('/blog/posts/popular', {
      params: { page, size }
    });
    return response.data.data;
  },

  // Get most liked posts
  async getMostLikedPosts(page: number = 0, size: number = 10): Promise<PageResponse<BlogPostListItem>> {
    const response = await blogApi.get<ApiResponse<PageResponse<BlogPostListItem>>>('/blog/posts/most-liked', {
      params: { page, size }
    });
    return response.data.data;
  },
};
