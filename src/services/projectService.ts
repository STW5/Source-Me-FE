import api from '@/lib/api';
import { ApiResponse } from '@/types/profile';
import { Project, ProjectCreateRequest } from '@/types/project';
import { PageResponse, SearchRequest } from '@/types/common';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<ApiResponse<Project[]>>('/projects');
    return response.data.data;
  },

  async searchProjects(params: SearchRequest): Promise<PageResponse<Project>> {
    const response = await api.get<ApiResponse<PageResponse<Project>>>('/projects/search', { params });
    return response.data.data;
  },

  async getProject(id: number): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data: ProjectCreateRequest): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },

  async updateProject(id: number, data: ProjectCreateRequest): Promise<Project> {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
