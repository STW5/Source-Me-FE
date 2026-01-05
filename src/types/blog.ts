export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostCreateRequest {
  title: string;
  slug: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface BlogPostUpdateRequest {
  title: string;
  slug: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
}
