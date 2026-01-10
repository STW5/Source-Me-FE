import { MediaFile } from './media';
import { Tag } from './tag';

export interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown?: string;
  startedAt?: string;
  endedAt?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  githubUrl?: string;
  demoUrl?: string;
  viewCount: number;
  likeCount: number;
  tags?: Tag[];
  thumbnailMedia?: MediaFile | null;
}

export interface ProjectCreateRequest {
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  startedAt?: string;
  endedAt?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  githubUrl?: string | null;
  demoUrl?: string | null;
  tagNames?: string[];
  thumbnailMediaId?: number | null;
}
