import api from '@/lib/api';
import { ApiResponse } from '@/types/profile';
import { Project } from '@/types/project';
import { PageResponse } from '@/types/common';

export const projectBookmarkService = {
  // Toggle bookmark (add/remove)
  async toggleBookmark(projectId: number): Promise<{ bookmarked: boolean }> {
    const response = await api.post<ApiResponse<{ bookmarked: boolean }>>(
      `/projects/${projectId}/bookmark`
    );
    return response.data.data;
  },

  // Check if user bookmarked the project
  async checkBookmarkStatus(projectId: number): Promise<{ bookmarked: boolean }> {
    const response = await api.get<ApiResponse<{ bookmarked: boolean }>>(
      `/projects/${projectId}/bookmark/status`
    );
    return response.data.data;
  },

  // Get user's bookmarked projects
  async getBookmarkedProjects(page: number = 0, size: number = 10): Promise<PageResponse<Project>> {
    const response = await api.get<ApiResponse<PageResponse<Project>>>(
      '/projects/bookmarks',
      { params: { page, size } }
    );
    return response.data.data;
  },
};
