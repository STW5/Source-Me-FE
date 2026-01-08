'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { mediaService } from '@/services/mediaService';
import { MediaUploadResponse, UploadProgress, FileUploadOptions, FileValidationError } from '@/types/media';

interface FileUploadProps {
  onUpload: (files: MediaUploadResponse | MediaUploadResponse[]) => void;
  onError?: (error: string) => void;
  options?: FileUploadOptions;
  className?: string;
}

export default function FileUpload({ onUpload, onError, options, className = '' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    multiple = false,
    accept = 'image/*,.pdf,.doc,.docx',
    maxFiles = multiple ? 10 : 1,
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes
  } = options || {};

  const validateFiles = (files: FileList): { validFiles: File[]; errors: FileValidationError[] } => {
    const validFiles: File[] = [];
    const errors: FileValidationError[] = [];

    // Check file count
    if (files.length > maxFiles) {
      for (let i = 0; i < files.length; i++) {
        errors.push({
          file: files[i],
          error: i >= maxFiles ? `최대 ${maxFiles}개 파일까지만 업로드할 수 있습니다.` : ''
        });
      }
      return { validFiles, errors };
    }

    // Validate each file
    Array.from(files).forEach((file) => {
      const validation = mediaService.validateFile(file, allowedTypes, maxSize);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push({
          file,
          error: validation.error || '파일 유효성 검사 실패'
        });
      }
    });

    return { validFiles, errors };
  };

  const handleFiles = async (files: FileList) => {
    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      onError?.(errors.map(e => e.error).join(', '));
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setValidationErrors([]);

    try {
      let result: MediaUploadResponse | MediaUploadResponse[];

      if (multiple) {
        result = await mediaService.uploadMultiple(validFiles, setUploadProgress);
      } else {
        result = await mediaService.uploadSingle(validFiles[0], setUploadProgress);
      }

      onUpload(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '파일 업로드 실패';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? '업로드 중...' : '파일을 선택하거나 드래그앤드롭하세요'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {multiple ? `최대 ${maxFiles}개 파일` : '1개 파일'} • 최대 {mediaService.formatFileSize(maxSize)}
            </p>
            {accept && (
              <p className="text-xs text-gray-400 mt-1">
                허용 형식: {accept}
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress && (
            <div className="w-full max-w-xs mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">업로드 진행률</span>
                <span className="text-sm font-medium text-gray-900">{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 space-y-2">
          {validationErrors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
              <span className="font-medium">{error.file.name}:</span> {error.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component for single file upload with preview
export function SingleFileUpload({
  onUpload,
  onError,
  currentFile,
  accept = 'image/*',
  className = '',
  onClear
}: {
  onUpload: (file: MediaUploadResponse) => void;
  onError?: (error: string) => void;
  currentFile?: MediaUploadResponse | null;
  accept?: string;
  className?: string;
  onClear?: () => void;
}) {
  const [uploadedFile, setUploadedFile] = useState<MediaUploadResponse | null | undefined>(currentFile);

  const handleUpload = (file: MediaUploadResponse | MediaUploadResponse[]) => {
    const uploaded = Array.isArray(file) ? file[0] : file;
    setUploadedFile(uploaded);
    onUpload(uploaded);
  };

  const handleRemove = () => {
    setUploadedFile(null);
    onClear?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {uploadedFile ? (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="relative group">
            {mediaService.isImageFile(uploadedFile.contentType || '') ||
            mediaService.isImageKey(uploadedFile.fileKey) ||
            mediaService.isImageKey(uploadedFile.originalName) ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={mediaService.getMediaUrl(uploadedFile) || mediaService.getFileUrl(uploadedFile.fileKey)}
                  alt={uploadedFile.originalName || '업로드 이미지'}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.originalName || '이름 없음'}</p>
                    <p className="text-xs text-gray-500">
                      {typeof uploadedFile.sizeBytes === 'number'
                        ? mediaService.formatFileSize(uploadedFile.sizeBytes)
                        : '크기 정보 없음'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Upload New File Button */}
          <button
            onClick={() => {
              setUploadedFile(null);
              onClear?.();
            }}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            다른 파일 업로드
          </button>
        </div>
      ) : (
        <FileUpload
          onUpload={handleUpload}
          onError={onError}
          options={{
            multiple: false,
            accept,
            maxFiles: 1
          }}
          className={className}
        />
      )}
    </div>
  );
}
