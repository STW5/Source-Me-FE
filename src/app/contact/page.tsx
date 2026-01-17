'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { profileService } from '@/services/profileService';
import { SiteProfile } from '@/types/profile';

export default function ContactPage() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

  const handleEmailCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
      alert('이메일 복사에 실패했습니다.');
    }
  };

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
    <>
      <Navigation />
      <div className="min-h-screen bg-white py-20 pt-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact</h1>
        <p className="text-xl text-gray-600 mb-12">
          프로젝트 협업이나 궁금한 점이 있으시면 연락주세요!
        </p>

        <div className="flex justify-center gap-6">
          {profile.email && (
            <button
              onClick={() => handleEmailCopy(profile.email!)}
              className="flex flex-col items-center justify-between gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 cursor-pointer relative w-48 h-40"
            >
              <div className="text-4xl">📧</div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-gray-700 font-medium">Email</span>
                <span className="text-sm text-gray-500 truncate max-w-full">{profile.email}</span>
              </div>
              {copied && (
                <span className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                  복사됨!
                </span>
              )}
            </button>
          )}

          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-between gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 w-48 h-40"
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
              className="flex flex-col items-center justify-between gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 w-48 h-40"
            >
              <div className="text-4xl">💼</div>
              <span className="text-gray-700 font-medium">LinkedIn</span>
            </a>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
