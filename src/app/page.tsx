'use client';

import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import { SiteProfile } from '@/types/profile';

export default function Home() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err) {
        setError('프로필을 불러오는데 실패했습니다.');
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="text-xl font-bold text-gray-900">{profile.displayName}</div>
            <div className="flex gap-6">
              <a href="#home" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#projects" className="text-gray-600 hover:text-gray-900 transition-colors">Projects</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Hello, I'm {profile.displayName}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {profile.headline}
          </p>
          <div className="flex justify-center gap-4">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
              >
                GitHub
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all hover:scale-105"
              >
                Contact
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">About Me</h2>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{profile.displayName}</h3>
                <p className="text-lg text-gray-600 mb-4">{profile.headline}</p>
                <div className="prose prose-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bioMarkdown}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Information</h3>
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                )}

                <div className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Links</h4>
                  <div className="flex flex-col gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        GitHub →
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {profile.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Resume →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen flex items-center justify-center py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Projects</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-4xl">🚀</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Project {i}</h3>
                  <p className="text-gray-600 mb-4">프로젝트 설명이 여기에 표시됩니다.</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">React</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Node.js</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Contact</h2>
          <p className="text-xl text-gray-600 mb-12">
            프로젝트 협업이나 궁금한 점이 있으시면 연락주세요!
          </p>

          <div className="flex justify-center gap-6">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">📧</div>
                <span className="text-gray-700 font-medium">Email</span>
              </a>
            )}

            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">💻</div>
                <span className="text-gray-700 font-medium">GitHub</span>
              </a>
            )}

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">💼</div>
                <span className="text-gray-700 font-medium">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 {profile.displayName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
