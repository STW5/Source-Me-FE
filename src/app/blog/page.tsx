'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { tagService } from '@/services/tagService';
import { authToken } from '@/lib/auth';
import { BlogPostListItem } from '@/types/blog';
import { Tag } from '@/types/tag';

export default function BlogListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag')?.trim() || '';
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authToken.isAuthenticated());
    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts(selectedTag);
  }, [selectedTag]);

  const fetchTags = async () => {
    try {
      const data = await tagService.getAllTags();
      setTags(data);
    } catch (err: any) {
      setTagsError('태그 목록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch tags:', err);
    }
  };

  const fetchPosts = async (tag?: string) => {
    try {
      setLoading(true);
      const isAuth = authToken.isAuthenticated();

      // Try to fetch all posts if authenticated, fallback to public if 403
      let data;
      if (isAuth) {
        try {
          data = await blogService.getAllPosts(tag);
        } catch (err: any) {
          // If 403 or 401, token might be invalid - clear it and fetch public posts
          if (err.response?.status === 403 || err.response?.status === 401) {
            authToken.remove();
            setIsAuthenticated(false);
            data = await blogService.getPublishedPosts(tag);
          } else {
            throw err;
          }
        }
      } else {
        data = await blogService.getPublishedPosts(tag);
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

  const handleTagFilter = (tagName?: string) => {
    if (!tagName) {
      router.push('/blog');
      return;
    }
    router.push(`/blog?tag=${encodeURIComponent(tagName)}`);
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">태그</h2>
            {selectedTag && (
              <button
                onClick={() => handleTagFilter()}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                필터 해제
              </button>
            )}
          </div>
          {tagsError ? (
            <p className="text-sm text-red-600">{tagsError}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagFilter()}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedTag
                    ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    : 'bg-blue-600 text-white border-blue-600'
                }`}
              >
                전체
              </button>
              {tags.map((tag) => {
                const isActive = tag.name === selectedTag;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedTag ? `"${selectedTag}" 태그의 글이 없습니다.` : '아직 작성된 글이 없습니다.'}
            </p>
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
                      <button
                        key={tag.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleTagFilter(tag.name);
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        {tag.name}
                      </button>
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
