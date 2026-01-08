'use client';

import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';
import { mediaService } from '@/services/mediaService';
import { SiteProfile } from '@/types/profile';
import { MediaUploadResponse } from '@/types/media';
import { SingleFileUpload } from './FileUpload';

interface ProfileEditModalProps {
  profile: SiteProfile | null;
  onClose: () => void;
  onSave: (updatedProfile: SiteProfile) => void;
}

export default function ProfileEditModal({ profile, onClose, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    headline: profile?.headline || '',
    bioMarkdown: profile?.bioMarkdown || '',
    email: profile?.email || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
    resumeUrl: profile?.resumeUrl || '',
    profilePictureId: profile?.profileMedia?.id ?? null,
  });
  const [profilePicture, setProfilePicture] = useState<MediaUploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        headline: profile.headline,
        bioMarkdown: profile.bioMarkdown,
        email: profile.email || '',
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        resumeUrl: profile.resumeUrl || '',
        profilePictureId: profile.profileMedia?.id ?? null,
      });
    }
  }, [profile]);

  const handleProfilePictureUpload = (file: MediaUploadResponse) => {
    setProfilePicture(file);
    setFormData(prev => ({ ...prev, profilePictureId: file.id }));
  };

  const handleProfilePictureClear = () => {
    setProfilePicture(null);
    setFormData(prev => ({ ...prev, profilePictureId: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileService.updateProfile({
        displayName: formData.displayName,
        headline: formData.headline,
        bioMarkdown: formData.bioMarkdown,
        email: formData.email || undefined,
        githubUrl: formData.githubUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        resumeUrl: formData.resumeUrl || undefined,
        profilePictureId: formData.profilePictureId ?? undefined,
      });

      onSave(updatedProfile);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '프로필 업데이트 실패');
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (profilePicture) {
      return mediaService.getMediaUrl(profilePicture);
    }
    if (profile?.profileMedia) {
      return mediaService.getMediaUrl(profile.profileMedia);
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">프로필 수정</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 사진
            </label>
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()!}
                    alt="Profile"
                    className="h-24 w-24 object-cover rounded-full border-4 border-gray-200"
                  />
                ) : (
                  <div className="h-24 w-24 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <SingleFileUpload
                  onUpload={handleProfilePictureUpload}
                  onError={(err) => setError(err)}
                  currentFile={profile?.profileMedia ?? null}
                  accept="image/*"
                  onClear={handleProfilePictureClear}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                한 줄 소개 *
              </label>
              <input
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="웹 개발자"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자기소개 *
            </label>
            <textarea
              required
              rows={5}
              value={formData.bioMarkdown}
              onChange={(e) => setFormData({ ...formData, bioMarkdown: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="자기소개를 Markdown 형식으로 작성하세요"
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">연락처 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이력서 URL
              </label>
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
