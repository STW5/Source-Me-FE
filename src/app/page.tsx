'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import ProfileEditModal from '@/components/ProfileEditModal';
import { profileService } from '@/services/profileService';
import { authToken } from '@/lib/auth';
import { mediaService } from '@/services/mediaService';
import { SiteProfile } from '@/types/profile';

export default function Home() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authToken.isAuthenticated());

    const fetchData = async () => {
      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">{error || '프로필을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const profileImageUrl = profile.profileMedia
    ? mediaService.getMediaUrl(profile.profileMedia)
    : null;

  return (
    <div className="bg-white">
      <Navigation />

      {/* Hero Section (About) */}
      <section id="about" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16 pb-12 md:pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-end justify-end mb-4 md:mb-8">
            {isAuthenticated && (
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                프로필 수정
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left: Profile Image */}
              <div className="flex justify-center md:justify-start">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${profile.displayName} 프로필 사진`}
                    className="h-48 w-48 md:h-64 md:w-64 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  />
                ) : (
                  <div className="h-48 w-48 md:h-64 md:w-64 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-200 shadow-lg">
                    <svg className="h-24 w-24 md:h-32 md:w-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                    Hello, I'm {profile.displayName}
                  </h1>
                  <p className="text-lg md:text-2xl text-gray-600 mb-4 md:mb-6">
                    {profile.headline}
                  </p>
                  <div className="prose prose-sm md:prose-lg max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {profile.bioMarkdown}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                {profile.email && (
                  <div className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                    <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="break-all">{profile.email}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-md"
                    >
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-md"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.resumeUrl && (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base bg-white text-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-md"
                    >
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Experience - Inside About Section */}
          {(profile.experienceHighlights || profile.skillsProficient || profile.backendExperience) && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Skills & Experience</h2>

              {/* Experience Highlights */}
              {profile.experienceHighlights && (() => {
                try {
                  const highlights = JSON.parse(profile.experienceHighlights);
                  return (
                    <div className="mb-10 pb-10 border-b border-gray-200">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">주요 경험</h3>
                      <ul className="space-y-3">
                        {highlights.map((item: string, index: number) => (
                          <li key={index} className="flex gap-3">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-1">•</span>
                            <span className="text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}

              {/* Skills */}
              {(profile.skillsProficient || profile.skillsEducation || profile.skillsCanUse) && (
                <div className="mb-10 pb-10 border-b border-gray-200">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">기술 스택</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {profile.skillsProficient && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                        <h4 className="text-base font-bold text-blue-900 mb-3">Proficient</h4>
                        <div className="space-y-2">
                          {profile.skillsProficient.split(',').map((skill, index) => (
                            <div key={index} className="text-gray-800 text-sm">{skill.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.skillsEducation && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                        <h4 className="text-base font-bold text-green-900 mb-3">Education</h4>
                        <div className="space-y-2">
                          {profile.skillsEducation.split(',').map((skill, index) => (
                            <div key={index} className="text-gray-800 text-sm">{skill.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.skillsCanUse && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                        <h4 className="text-base font-bold text-purple-900 mb-3">Can Use</h4>
                        <div className="space-y-2">
                          {profile.skillsCanUse.split(',').map((skill, index) => (
                            <div key={index} className="text-gray-800 text-sm">{skill.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Backend Experience */}
              {profile.backendExperience && (() => {
                try {
                  const experiences = JSON.parse(profile.backendExperience);
                  return (
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">백엔드 경험</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {experiences.map((item: string, index: number) => (
                          <div key={index} className="flex gap-2 items-start">
                            <span className="text-blue-600 flex-shrink-0 mt-0.5">✓</span>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          )}

          {/* Work History Section */}
          {profile.workHistory && profile.workHistory.length > 0 && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Work History</h2>
              <div className="space-y-10">
                {profile.workHistory.map((work, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{work.organization}</h3>
                    <p className="text-lg text-gray-600 mb-2">{work.period}</p>
                    <p className="text-lg font-medium text-gray-800 mb-4">{work.role}</p>
                    {work.projects && work.projects.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">프로젝트</h4>
                        <ul className="space-y-2">
                          {work.projects.map((project, projIndex) => (
                            <li key={projIndex} className="flex gap-3">
                              <span className="text-purple-600 font-bold flex-shrink-0 mt-1">•</span>
                              <span className="text-gray-700">{project}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {work.activities && work.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">활동</h4>
                        <ul className="space-y-2">
                          {work.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex gap-3">
                              <span className="text-purple-600 font-bold flex-shrink-0 mt-1">•</span>
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internships Section */}
          {profile.internships && profile.internships.length > 0 && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Internship</h2>
              <div className="space-y-8">
                {profile.internships.map((internship, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{internship.title}</h3>
                    <p className="text-lg text-gray-600 mb-3">{internship.period}</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{internship.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Education</h2>
              <div className="space-y-10">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{edu.institution}</h3>
                    <p className="text-lg text-gray-600 mb-2">{edu.period}</p>
                    {edu.major && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">주전공: </span>
                        <span className="text-gray-700">{edu.major}</span>
                      </div>
                    )}
                    {edu.minor && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">부전공: </span>
                        <span className="text-gray-700">{edu.minor}</span>
                      </div>
                    )}
                    {edu.gpa && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">전체 평점: </span>
                        <span className="text-gray-700">{edu.gpa}</span>
                      </div>
                    )}
                    {edu.majorGpa && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">전공 평점: </span>
                        <span className="text-gray-700">{edu.majorGpa}</span>
                      </div>
                    )}
                    {edu.activities && edu.activities.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">활동</h4>
                        <ul className="space-y-2">
                          {edu.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex gap-3">
                              <span className="text-green-600 font-bold flex-shrink-0 mt-1">•</span>
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications & Patents Section */}
          {profile.publicationsPatents && profile.publicationsPatents.length > 0 && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Publications & Patents</h2>
              <div className="space-y-10">
                {profile.publicationsPatents.map((item, index) => (
                  <div key={index} className={`border-l-4 ${item.type === 'PUBLICATION' ? 'border-indigo-500' : 'border-orange-500'} pl-6`}>
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${item.type === 'PUBLICATION' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
                        {item.type === 'PUBLICATION' ? '논문 게재' : '특허 출원'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-lg text-gray-600 mb-2">{item.details}</p>
                    <p className="text-gray-500 mb-3">{item.date}</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Section */}
          {profile.certificates && profile.certificates.length > 0 && (
            <div className="mt-8 md:mt-16 bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 hover:shadow-3xl transition-shadow">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-12 text-center">Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {profile.certificates.map((cert, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{cert.name}</h3>
                    <p className="text-gray-600 mb-1">{cert.issuer}</p>
                    <p className="text-gray-500 text-sm mb-2">{cert.date}</p>
                    {cert.score && (
                      <p className="text-gray-700 font-medium">점수: {cert.score}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={(updatedProfile) => setProfile(updatedProfile)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 {profile.displayName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
