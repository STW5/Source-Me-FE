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
  teamSize?: string;
  role?: string;
  ownedServices?: string;
  introductionMarkdown?: string;
  responsibilitiesMarkdown?: string;
  troubleshootingMarkdown?: string;
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
  teamSize?: string | null;
  role?: string | null;
  ownedServices?: string | null;
  introductionMarkdown?: string | null;
  responsibilitiesMarkdown?: string | null;
  troubleshootingMarkdown?: string | null;
  tagNames?: string[];
  thumbnailMediaId?: number | null;
}
