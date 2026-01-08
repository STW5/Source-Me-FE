export interface MediaFile {
  id: number;
  storageType: string;
  fileKey: string;
  publicUrl?: string;
  originalName: string;
  contentType?: string;
  sizeBytes: number;
  createdAt: string;
}

export type MediaUploadResponse = MediaFile;

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadOptions {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileValidationError {
  file: File;
  error: string;
}
