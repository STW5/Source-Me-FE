import axios from 'axios';
import { authToken } from '@/lib/auth';
import { ApiResponse } from '@/types/profile';
import { MediaUploadResponse, UploadProgress } from '@/types/media';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
const apiBaseHost = apiBaseUrl.replace('/api/v1', '');

const mediaApi = axios.create({
  baseURL: apiBaseUrl.replace('/api/v1', '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

mediaApi.interceptors.request.use(
  (config) => {
    const token = authToken.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

mediaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken.remove();
    }
    return Promise.reject(error);
  }
);

export const mediaService = {
  async uploadSingle(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await mediaApi.post<ApiResponse<MediaUploadResponse>>(
      '/media/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  },

  async uploadMultiple(
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await mediaApi.post<ApiResponse<MediaUploadResponse[]>>(
      '/media/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  },

  getFileUrl(fileKey: string): string {
    return `${apiBaseHost}/api/media/files/${fileKey}`;
  },

  getFileDownloadUrl(fileKey: string): string {
    return `${apiBaseHost}/api/media/files/${fileKey}`;
  },

  getMediaUrl(media?: { publicUrl?: string | null; fileKey?: string | null }): string | null {
    if (!media) {
      return null;
    }
    if (media.publicUrl) {
      if (media.publicUrl.startsWith('http')) {
        return media.publicUrl;
      }
      return `${apiBaseHost}${media.publicUrl}`;
    }
    if (media.fileKey) {
      return `${apiBaseHost}/api/media/files/${media.fileKey}`;
    }
    return null;
  },

  validateFile(file: File, allowedTypes?: string[], maxSize?: number): { isValid: boolean; error?: string } {
    const defaultAllowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const defaultMaxSize = 10 * 1024 * 1024; // 10MB

    const types = allowedTypes || defaultAllowedTypes;
    const size = maxSize || defaultMaxSize;

    // Check file type
    if (!types.includes(file.type)) {
      return {
        isValid: false,
        error: `지원하지 않는 파일 형식입니다: ${file.type}`,
      };
    }

    // Check file size
    if (file.size > size) {
      const sizeMB = Math.round(size / (1024 * 1024));
      return {
        isValid: false,
        error: `파일 크기가 ${sizeMB}MB를 초과했습니다.`,
      };
    }

    return { isValid: true };
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  },

  isImageKey(fileKey?: string | null): boolean {
    if (!fileKey) {
      return false;
    }
    const normalized = fileKey.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some((ext) => normalized.endsWith(ext));
  },

  isPdfFile(contentType: string): boolean {
    return contentType === 'application/pdf';
  },
};
