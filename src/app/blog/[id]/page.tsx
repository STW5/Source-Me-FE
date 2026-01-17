'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navigation from '@/components/Navigation';
import { blogService } from '@/services/blogService';
import { blogLikeService } from '@/services/blogLikeService';
import { blogBookmarkService } from '@/services/blogBookmarkService';
import { authToken } from '@/lib/auth';
import { mediaService } from '@/services/mediaService';
import { BlogPost } from '@/types/blog';

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Prevent duplicate view count increment in React StrictMode
  const viewCountIncremented = useRef(false);

  useEffect(() => {
    setIsAuthenticated(authToken.isAuthenticated());

    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post data
        const data = await blogService.getPost(id);
        if (isCancelled) return;

        setPost(data);
        setLikeCount(data.likeCount);

        // Increment view count only once per component mount
        if (!viewCountIncremented.current) {
          viewCountIncremented.current = true;
          await blogService.incrementViewCount(id);
        }

        // Fetch interaction status (only if authenticated)
        if (authToken.isAuthenticated()) {
          const [likeStatus, bookmarkStatus] = await Promise.all([
            blogLikeService.checkLikeStatus(id),
            blogBookmarkService.checkBookmarkStatus(id),
          ]);
          if (isCancelled) return;

          setIsLiked(likeStatus.liked);
          setIsBookmarked(bookmarkStatus.bookmarked);
        }
      } catch (err: any) {
        if (isCancelled) return;
        setError('블로그 글을 찾을 수 없습니다.');
        console.error('Failed to fetch post:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
      // Reset ref when component unmounts
      viewCountIncremented.current = false;
    };
  }, [id]);


  const handleLikeToggle = async () => {
    if (!authToken.isAuthenticated()) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const result = await blogLikeService.toggleLike(id);
      setIsLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!authToken.isAuthenticated()) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const result = await blogBookmarkService.toggleBookmark(id);
      setIsBookmarked(result.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      alert('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('정말 이 글을 삭제하시겠습니까?')) return;

    try {
      await blogService.deletePost(post.id);
      router.push('/blog');
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

  const handleTagClick = (tagName: string) => {
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

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-red-600 mb-4">{error || '블로그 글을 찾을 수 없습니다.'}</p>
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Article */}
      <article className="container mx-auto px-4 py-12 max-w-3xl pt-24">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/blog')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← 목록으로
          </button>
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/blog/edit/${post.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
            {post.status === 'DRAFT' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                초안
              </span>
            )}
          </div>

          {post.thumbnailMedia && (
            <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-6">
              <img
                src={mediaService.getMediaUrl(post.thumbnailMedia) || mediaService.getFileUrl(post.thumbnailMedia.fileKey)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-600">
              <time dateTime={post.publishedAt || post.createdAt}>
                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
              </time>
              {post.updatedAt && post.createdAt !== post.updatedAt && (
                <span className="text-sm text-gray-500">
                  (수정됨: {formatDate(post.updatedAt)})
                </span>
              )}
              <span className="text-sm text-gray-500">조회 {post.viewCount}</span>
            </div>

            {/* Like and Bookmark Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isLiked ? '좋아요 취소' : '좋아요'}
              >
                <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                <span className="font-medium">{likeCount}</span>
              </button>

              <button
                onClick={handleBookmarkToggle}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isBookmarked ? '북마크 취소' : '북마크'}
              >
                <span className="text-lg">{isBookmarked ? '⭐' : '☆'}</span>
              </button>
            </div>
          </div>

          {post.summary && (
            <p className="mt-4 text-xl text-gray-600 leading-relaxed">{post.summary}</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.name)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4 first:mt-0" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-900 text-lg leading-relaxed mb-4" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-900 text-lg space-y-2 mb-4 ml-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-900 text-lg space-y-2 mb-4 ml-4" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-900" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 hover:underline" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
              em: ({node, ...props}) => <em className="italic text-gray-900" {...props} />,
              code: ({node, inline, ...props}: any) =>
                inline
                  ? <code className="bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  : <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" {...props} />,
            }}
          >
            {post.contentMarkdown}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
