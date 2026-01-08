import api from '@/lib/api';
import { ApiResponse, ProfileUpdateRequest, SiteProfile } from '@/types/profile';

export const profileService = {
  async getProfile(): Promise<SiteProfile> {
    const response = await api.get<ApiResponse<SiteProfile>>('/profile');
    return response.data.data;
  },

  async updateProfile(profile: ProfileUpdateRequest): Promise<SiteProfile> {
    const response = await api.put<ApiResponse<SiteProfile>>('/profile', profile);
    return response.data.data;
  },
};
