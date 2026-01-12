import api from '@/lib/api';
import { ApiResponse } from '@/types/profile';

export const projectLikeService = {
  // Toggle like (add/remove)
  async toggleLike(projectId: number): Promise<{ liked: boolean }> {
    const response = await api.post<ApiResponse<{ liked: boolean }>>(
      `/projects/${projectId}/like`
    );
    return response.data.data;
  },

  // Check if user liked the project
  async checkLikeStatus(projectId: number): Promise<{ liked: boolean }> {
    const response = await api.get<ApiResponse<{ liked: boolean }>>(
      `/projects/${projectId}/like/status`
    );
    return response.data.data;
  },

  // Get like count for a project
  async getLikeCount(projectId: number): Promise<{ count: number }> {
    const response = await api.get<ApiResponse<{ count: number }>>(
      `/projects/${projectId}/like/count`
    );
    return response.data.data;
  },
};
