'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { authToken } from '@/lib/auth';
import { BlogPostCreateRequest } from '@/types/blog';

export default function NewBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BlogPostCreateRequest>({
    title: '',
    slug: '',
    summary: '',
    contentMarkdown: '',
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!authToken.isAuthenticated()) {
      alert('로그인이 필요합니다.');
      router.push('/');
    }
  }, [router]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug === '' ? generateSlug(title) : formData.slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = { ...formData, status };
      await blogService.createPost(data);
      router.push('/blog');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">새 글 작성</h1>
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
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="블로그 글 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug * (URL 경로용)
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-sm"
              placeholder="my-blog-post"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL: /blog/{formData.slug || 'my-blog-post'}
            </p>
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
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '초안 저장'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'PUBLISHED')}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '발행 중...' : '발행하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
