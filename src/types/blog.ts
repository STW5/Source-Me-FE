export interface BlogPost {
  id: string; // UUID
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListItem {
  id: string; // UUID
  title: string;
  summary?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostCreateRequest {
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface BlogPostUpdateRequest {
  title: string;
  summary?: string;
  contentMarkdown: string;
  status: 'DRAFT' | 'PUBLISHED';
}
