import api from '@/lib/api';
import { ApiResponse, SiteProfile } from '@/types/profile';

export const profileService = {
  async getProfile(): Promise<SiteProfile> {
    const response = await api.get<ApiResponse<SiteProfile>>('/profile');
    return response.data.data;
  },

  async updateProfile(profile: Omit<SiteProfile, 'id'>): Promise<SiteProfile> {
    const response = await api.put<ApiResponse<SiteProfile>>('/profile', profile);
    return response.data.data;
  },
};
