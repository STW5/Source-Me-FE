'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { authToken } from '@/lib/auth';
import { BlogPostListItem } from '@/types/blog';

export default function BlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authToken.isAuthenticated());
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const isAuth = authToken.isAuthenticated();

      // Try to fetch all posts if authenticated, fallback to public if 403
      let data;
      if (isAuth) {
        try {
          data = await blogService.getAllPosts();
        } catch (err: any) {
          // If 403 or 401, token might be invalid - clear it and fetch public posts
          if (err.response?.status === 403 || err.response?.status === 401) {
            authToken.remove();
            setIsAuthenticated(false);
            data = await blogService.getPublishedPosts();
          } else {
            throw err;
          }
        }
      } else {
        data = await blogService.getPublishedPosts();
      }

      setPosts(data);
    } catch (err: any) {
      setError('블로그 글을 불러오는데 실패했습니다.');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return;

    try {
      await blogService.deletePost(id);
      await fetchPosts();
    } catch (err: any) {
      alert(`삭제 실패: ${err.response?.data?.message || err.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-bold text-gray-900 hover:text-gray-700"
            >
              ← Home
            </button>
            {isAuthenticated && (
              <button
                onClick={() => router.push('/blog/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 새 글 작성
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Blog List */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => router.push(`/blog/${post.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  {post.status === 'DRAFT' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      초안
                    </span>
                  )}
                </div>

                {post.summary && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.summary}</p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={post.publishedAt || post.createdAt}>
                    {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                  </time>

                  {isAuthenticated && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/blog/edit/${post.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
