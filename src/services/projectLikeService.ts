import api from '@/lib/api';
import { ApiResponse } from '@/types/profile';

export const projectLikeService = {
  // Toggle like (add/remove)
  async toggleLike(projectId: number, userId: number): Promise<{ liked: boolean }> {
    const response = await api.post<ApiResponse<{ liked: boolean }>>(
      `/projects/${projectId}/like`,
      null,
      { params: { userId } }
    );
    return response.data.data;
  },

  // Check if user liked the project
  async checkLikeStatus(projectId: number, userId: number): Promise<{ liked: boolean }> {
    const response = await api.get<ApiResponse<{ liked: boolean }>>(
      `/projects/${projectId}/like/status`,
      { params: { userId } }
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
