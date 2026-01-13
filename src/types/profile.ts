import type { MediaFile } from './media';

export interface SiteProfile {
  id: number;
  displayName: string;
  headline: string;
  bioMarkdown: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  careerGoal?: string;
  experienceHighlights?: string;
  skillsProficient?: string;
  skillsEducation?: string;
  skillsCanUse?: string;
  backendExperience?: string;
  profileMedia?: MediaFile | null;
}

export interface ProfileUpdateRequest {
  displayName: string;
  headline: string;
  bioMarkdown: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  careerGoal?: string;
  experienceHighlights?: string;
  skillsProficient?: string;
  skillsEducation?: string;
  skillsCanUse?: string;
  backendExperience?: string;
  profilePictureId?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}
