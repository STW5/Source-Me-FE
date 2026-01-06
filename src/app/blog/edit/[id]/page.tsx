'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { authToken } from '@/lib/auth';
import { BlogPost, BlogPostUpdateRequest } from '@/types/blog';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostUpdateRequest>({
    title: '',
    summary: '',
    contentMarkdown: '',
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!authToken.isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }

    fetchPost();
  }, [id, router]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await blogService.getPost(id);
      setPost(data);
      setFormData({
        title: data.title,
        summary: data.summary || '',
        contentMarkdown: data.contentMarkdown,
        status: data.status,
      });
    } catch (err: any) {
      setError('블로그 글을 불러오는데 실패했습니다.');
      console.error('Failed to fetch post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const data = { ...formData, status };
      await blogService.updatePost(id, data);
      router.push('/blog');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/blog')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">글 수정</h1>
            <button
              onClick={() => router.push('/blog')}
              className="text-gray-600 hover:text-gray-900"
            >
              취소
            </button>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="블로그 글 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요약 (선택)
            </label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="블로그 글의 간단한 요약을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              본문 * (Markdown)
            </label>
            <textarea
              required
              rows={15}
              value={formData.contentMarkdown}
              onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono"
              placeholder="블로그 본문을 Markdown 형식으로 작성하세요"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/blog')}
              disabled={saving}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '초안으로 저장'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'PUBLISHED')}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '발행 중...' : '발행하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
