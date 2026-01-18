'use client';

import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';
import { mediaService } from '@/services/mediaService';
import type { PublicationPatentEntry, SiteProfile } from '@/types/profile';
import { MediaUploadResponse } from '@/types/media';
import { SingleFileUpload } from './FileUpload';

interface ProfileEditModalProps {
  profile: SiteProfile | null;
  onClose: () => void;
  onSave: (updatedProfile: SiteProfile) => void;
}

export default function ProfileEditModal({ profile, onClose, onSave }: ProfileEditModalProps) {
  const toMultilineText = (value?: string) => {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join('\n');
      }
    } catch {
      return value;
    }
    return value;
  };

  const toJsonArrayString = (value: string) => {
    const items = value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    return items.length > 0 ? JSON.stringify(items) : '';
  };

  const linesToArray = (value: string) => {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
  };

  const arrayToLines = (value?: string[]) => {
    return value && value.length > 0 ? value.join('\n') : '';
  };

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    headline: profile?.headline || '',
    bioMarkdown: profile?.bioMarkdown || '',
    email: profile?.email || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
    resumeUrl: profile?.resumeUrl || '',
    careerGoal: profile?.careerGoal || '',
    experienceHighlights: toMultilineText(profile?.experienceHighlights),
    skillsProficient: profile?.skillsProficient || '',
    skillsEducation: profile?.skillsEducation || '',
    skillsCanUse: profile?.skillsCanUse || '',
    backendExperience: toMultilineText(profile?.backendExperience),
    internships: profile?.internships || [],
    education: profile?.education || [],
    workHistory: profile?.workHistory || [],
    publicationsPatents: profile?.publicationsPatents || [],
    certificates: profile?.certificates || [],
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
        careerGoal: profile.careerGoal || '',
        experienceHighlights: toMultilineText(profile.experienceHighlights),
        skillsProficient: profile.skillsProficient || '',
        skillsEducation: profile.skillsEducation || '',
        skillsCanUse: profile.skillsCanUse || '',
        backendExperience: toMultilineText(profile.backendExperience),
        internships: profile.internships || [],
        education: profile.education || [],
        workHistory: profile.workHistory || [],
        publicationsPatents: profile.publicationsPatents || [],
        certificates: profile.certificates || [],
        profilePictureId: profile.profileMedia?.id ?? null,
      });
    }
  }, [profile]);

  const updateListItem = <T,>(list: T[], index: number, item: T) => {
    return list.map((current, currentIndex) => (currentIndex === index ? item : current));
  };

  const removeListItem = <T,>(list: T[], index: number) => {
    return list.filter((_, currentIndex) => currentIndex !== index);
  };

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
        email: formData.email,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        resumeUrl: formData.resumeUrl,
        careerGoal: formData.careerGoal,
        experienceHighlights: toJsonArrayString(formData.experienceHighlights),
        skillsProficient: formData.skillsProficient,
        skillsEducation: formData.skillsEducation,
        skillsCanUse: formData.skillsCanUse,
        backendExperience: toJsonArrayString(formData.backendExperience),
        internships: formData.internships,
        education: formData.education,
        workHistory: formData.workHistory,
        publicationsPatents: formData.publicationsPatents,
        certificates: formData.certificates,
        profilePictureId: formData.profilePictureId,
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

          {/* About Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">About 정보</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                커리어 목표
              </label>
              <textarea
                rows={3}
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="커리어 목표를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주요 경험 (한 줄에 하나씩)
              </label>
              <textarea
                rows={4}
                value={formData.experienceHighlights}
                onChange={(e) => setFormData({ ...formData, experienceHighlights: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder={"경험 항목을 줄바꿈으로 입력하세요\n예) 대규모 트래픽 처리 경험"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficient (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={formData.skillsProficient}
                  onChange={(e) => setFormData({ ...formData, skillsProficient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Java, Spring Boot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={formData.skillsEducation}
                  onChange={(e) => setFormData({ ...formData, skillsEducation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="CS, Data Structures"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Can Use (쉼표 구분)
                </label>
                <input
                  type="text"
                  value={formData.skillsCanUse}
                  onChange={(e) => setFormData({ ...formData, skillsCanUse: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="AWS, Redis"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                백엔드 경험 (한 줄에 하나씩)
              </label>
              <textarea
                rows={4}
                value={formData.backendExperience}
                onChange={(e) => setFormData({ ...formData, backendExperience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder={"경험 항목을 줄바꿈으로 입력하세요\n예) REST API 설계/구현"}
              />
            </div>
          </div>

          {/* About Sections */}
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-900">About 섹션</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">Internships</h4>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    internships: [...formData.internships, { title: '', period: '', description: '' }],
                  })}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  추가
                </button>
              </div>
              {formData.internships.length === 0 && (
                <p className="text-sm text-gray-500">등록된 인턴십 정보가 없습니다.</p>
              )}
              {formData.internships.map((internship, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        internships: removeListItem(formData.internships, index),
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                  <input
                    type="text"
                    value={internship.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      internships: updateListItem(formData.internships, index, {
                        ...internship,
                        title: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="인턴십 제목"
                  />
                  <input
                    type="text"
                    value={internship.period}
                    onChange={(e) => setFormData({
                      ...formData,
                      internships: updateListItem(formData.internships, index, {
                        ...internship,
                        period: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="기간 (예: 2023.01-2023.06)"
                  />
                  <textarea
                    rows={3}
                    value={internship.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      internships: updateListItem(formData.internships, index, {
                        ...internship,
                        description: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="설명"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">Education</h4>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    education: [...formData.education, { institution: '', period: '', major: '', minor: '', gpa: '', majorGpa: '', activities: [] }],
                  })}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  추가
                </button>
              </div>
              {formData.education.length === 0 && (
                <p className="text-sm text-gray-500">등록된 학력 정보가 없습니다.</p>
              )}
              {formData.education.map((education, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        education: removeListItem(formData.education, index),
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setFormData({
                      ...formData,
                      education: updateListItem(formData.education, index, {
                        ...education,
                        institution: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="학교/기관"
                  />
                  <input
                    type="text"
                    value={education.period}
                    onChange={(e) => setFormData({
                      ...formData,
                      education: updateListItem(formData.education, index, {
                        ...education,
                        period: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="기간 (예: 2019-2023)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={education.major || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        education: updateListItem(formData.education, index, {
                          ...education,
                          major: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="전공"
                    />
                    <input
                      type="text"
                      value={education.minor || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        education: updateListItem(formData.education, index, {
                          ...education,
                          minor: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="부전공"
                    />
                    <input
                      type="text"
                      value={education.gpa || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        education: updateListItem(formData.education, index, {
                          ...education,
                          gpa: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="전체 평점"
                    />
                    <input
                      type="text"
                      value={education.majorGpa || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        education: updateListItem(formData.education, index, {
                          ...education,
                          majorGpa: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="전공 평점"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={arrayToLines(education.activities)}
                    onChange={(e) => setFormData({
                      ...formData,
                      education: updateListItem(formData.education, index, {
                        ...education,
                        activities: linesToArray(e.target.value),
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder={"활동 (한 줄에 하나씩)\n예) 학회 활동"}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">Work History</h4>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    workHistory: [...formData.workHistory, { organization: '', period: '', role: '', projects: [], activities: [] }],
                  })}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  추가
                </button>
              </div>
              {formData.workHistory.length === 0 && (
                <p className="text-sm text-gray-500">등록된 경력 정보가 없습니다.</p>
              )}
              {formData.workHistory.map((work, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        workHistory: removeListItem(formData.workHistory, index),
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                  <input
                    type="text"
                    value={work.organization}
                    onChange={(e) => setFormData({
                      ...formData,
                      workHistory: updateListItem(formData.workHistory, index, {
                        ...work,
                        organization: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="회사/기관"
                  />
                  <input
                    type="text"
                    value={work.period}
                    onChange={(e) => setFormData({
                      ...formData,
                      workHistory: updateListItem(formData.workHistory, index, {
                        ...work,
                        period: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="기간"
                  />
                  <input
                    type="text"
                    value={work.role}
                    onChange={(e) => setFormData({
                      ...formData,
                      workHistory: updateListItem(formData.workHistory, index, {
                        ...work,
                        role: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="직무"
                  />
                  <textarea
                    rows={3}
                    value={arrayToLines(work.projects)}
                    onChange={(e) => setFormData({
                      ...formData,
                      workHistory: updateListItem(formData.workHistory, index, {
                        ...work,
                        projects: linesToArray(e.target.value),
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder={"프로젝트 (한 줄에 하나씩)\n예) 결제 시스템 개선"}
                  />
                  <textarea
                    rows={3}
                    value={arrayToLines(work.activities)}
                    onChange={(e) => setFormData({
                      ...formData,
                      workHistory: updateListItem(formData.workHistory, index, {
                        ...work,
                        activities: linesToArray(e.target.value),
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder={"활동 (한 줄에 하나씩)\n예) 코드 리뷰 리딩"}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">Publications & Patents</h4>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    publicationsPatents: [...formData.publicationsPatents, { type: 'PUBLICATION', title: '', details: '', date: '', description: '' }],
                  })}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  추가
                </button>
              </div>
              {formData.publicationsPatents.length === 0 && (
                <p className="text-sm text-gray-500">등록된 논문/특허 정보가 없습니다.</p>
              )}
              {formData.publicationsPatents.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        publicationsPatents: removeListItem(formData.publicationsPatents, index),
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                  <select
                    value={item.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      publicationsPatents: updateListItem(formData.publicationsPatents, index, {
                        ...item,
                        type: e.target.value as PublicationPatentEntry['type'],
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="PUBLICATION">논문</option>
                    <option value="PATENT">특허</option>
                  </select>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      publicationsPatents: updateListItem(formData.publicationsPatents, index, {
                        ...item,
                        title: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="제목"
                  />
                  <input
                    type="text"
                    value={item.details}
                    onChange={(e) => setFormData({
                      ...formData,
                      publicationsPatents: updateListItem(formData.publicationsPatents, index, {
                        ...item,
                        details: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="세부 정보"
                  />
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => setFormData({
                      ...formData,
                      publicationsPatents: updateListItem(formData.publicationsPatents, index, {
                        ...item,
                        date: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="날짜"
                  />
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      publicationsPatents: updateListItem(formData.publicationsPatents, index, {
                        ...item,
                        description: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="설명"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-900">Certificates</h4>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    certificates: [...formData.certificates, { name: '', issuer: '', date: '', score: '' }],
                  })}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  추가
                </button>
              </div>
              {formData.certificates.length === 0 && (
                <p className="text-sm text-gray-500">등록된 자격증 정보가 없습니다.</p>
              )}
              {formData.certificates.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        certificates: removeListItem(formData.certificates, index),
                      })}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificates: updateListItem(formData.certificates, index, {
                        ...cert,
                        name: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="자격증 이름"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => setFormData({
                      ...formData,
                      certificates: updateListItem(formData.certificates, index, {
                        ...cert,
                        issuer: e.target.value,
                      }),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="발급 기관"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => setFormData({
                        ...formData,
                        certificates: updateListItem(formData.certificates, index, {
                          ...cert,
                          date: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="취득일"
                    />
                    <input
                      type="text"
                      value={cert.score || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        certificates: updateListItem(formData.certificates, index, {
                          ...cert,
                          score: e.target.value,
                        }),
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="점수 (선택)"
                    />
                  </div>
                </div>
              ))}
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
