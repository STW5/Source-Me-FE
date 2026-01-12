import { MediaFile } from './media';
import { Tag } from './tag';

export interface BlogPost {
  id: string; // UUID
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  tags: Tag[];
  thumbnailMedia?: MediaFile | null;
}

export interface BlogPostListItem {
  id: string; // UUID
  title: string;
  summary?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  tags: Tag[];
  thumbnailMedia?: MediaFile | null;
}

export interface BlogPostCreateRequest {
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
  tagNames: string[];
  thumbnailMediaId?: number | null;
}

export interface BlogPostUpdateRequest {
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
  tagNames: string[];
  thumbnailMediaId?: number | null;
}
