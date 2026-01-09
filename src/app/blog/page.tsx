'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { blogService } from '@/services/blogService';
import { tagService } from '@/services/tagService';
import { authToken } from '@/lib/auth';
import { BlogPostListItem } from '@/types/blog';
import { Tag } from '@/types/tag';
import { PageResponse } from '@/types/common';

export default function BlogListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag')?.trim() || '';
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [postPage, setPostPage] = useState<PageResponse<BlogPostListItem> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authToken.isAuthenticated());
    fetchTags();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      // 태그 필터가 있으면 기존 방식 사용 (검색 비활성화)
      setUseSearch(false);
      setSearchKeyword('');
      setSearchInput('');
      fetchPosts(selectedTag);
    } else if (useSearch) {
      // 검색 모드
      fetchPostsWithSearch();
    } else {
      // 기본 모드 (태그 필터 없음)
      fetchPosts();
    }
  }, [selectedTag, currentPage, searchKeyword, useSearch]);

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
      setPostPage(null); // 기존 방식에서는 페이징 정보 없음
    } catch (err: any) {
      setError('블로그 글을 불러오는데 실패했습니다.');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsWithSearch = async () => {
    try {
      setLoading(true);
      const pageData = await blogService.searchPublishedPosts({
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setPostPage(pageData);
      setPosts(pageData.content);
    } catch (err: any) {
      setError('블로그 글을 불러오는데 실패했습니다.');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
    setCurrentPage(0);
    setUseSearch(true);
    // 검색 시 태그 필터 제거
    if (selectedTag) {
      router.push('/blog');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="블로그 검색 (제목, 내용, 요약, 태그)..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchKeyword('');
                  setCurrentPage(0);
                  setUseSearch(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
          {searchKeyword && (
            <p className="mt-2 text-sm text-gray-600">
              "{searchKeyword}" 검색 결과: {postPage?.totalElements || 0}개
            </p>
          )}
        </form>

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

            {/* Pagination */}
            {postPage && postPage.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={postPage.first}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    postPage.first
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  이전
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, postPage.totalPages) }, (_, i) => {
                    let pageNum;
                    if (postPage.totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > postPage.totalPages - 4) {
                      pageNum = postPage.totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={postPage.last}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    postPage.last
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  다음
                </button>

                <span className="ml-4 text-sm text-gray-600">
                  {currentPage + 1} / {postPage.totalPages} 페이지
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
