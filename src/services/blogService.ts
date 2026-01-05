import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';
import { BlogPost, BlogPostListItem, BlogPostCreateRequest, BlogPostUpdateRequest } from '@/types/blog';

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
  async getPublishedPosts(): Promise<BlogPostListItem[]> {
    const response = await blogApi.get<ApiResponse<BlogPostListItem[]>>('/blog/posts');
    return response.data.data;
  },

  // Get all posts including drafts (admin)
  async getAllPosts(): Promise<BlogPostListItem[]> {
    const response = await blogApi.get<ApiResponse<BlogPostListItem[]>>('/blog/admin/posts');
    return response.data.data;
  },

  // Get post by ID
  async getPost(id: number): Promise<BlogPost> {
    const response = await blogApi.get<ApiResponse<BlogPost>>(`/blog/posts/${id}`);
    return response.data.data;
  },

  // Get post by slug (public)
  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await blogApi.get<ApiResponse<BlogPost>>(`/blog/posts/slug/${slug}`);
    return response.data.data;
  },

  // Create post (requires auth)
  async createPost(data: BlogPostCreateRequest): Promise<BlogPost> {
    const response = await blogApi.post<ApiResponse<BlogPost>>('/blog/posts', data);
    return response.data.data;
  },

  // Update post (requires auth)
  async updatePost(id: number, data: BlogPostUpdateRequest): Promise<BlogPost> {
    const response = await blogApi.put<ApiResponse<BlogPost>>(`/blog/posts/${id}`, data);
    return response.data.data;
  },

  // Delete post (requires auth)
  async deletePost(id: number): Promise<void> {
    await blogApi.delete(`/blog/posts/${id}`);
  },
};
