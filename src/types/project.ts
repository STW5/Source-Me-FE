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
  tags?: Tag[];
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
}
