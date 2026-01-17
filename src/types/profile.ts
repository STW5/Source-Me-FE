import type { MediaFile } from './media';

export interface InternshipEntry {
  title: string;
  period: string;
  description: string;
}

export interface EducationEntry {
  institution: string;
  period: string;
  major?: string;
  minor?: string;
  gpa?: string;
  majorGpa?: string;
  activities?: string[];
}

export interface WorkHistoryEntry {
  organization: string;
  period: string;
  role: string;
  projects?: string[];
  activities?: string[];
}

export interface PublicationPatentEntry {
  type: 'PUBLICATION' | 'PATENT';
  title: string;
  details: string;
  date: string;
  description: string;
}

export interface CertificateEntry {
  name: string;
  issuer: string;
  date: string;
  score?: string;
}

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
  internships?: InternshipEntry[];
  education?: EducationEntry[];
  workHistory?: WorkHistoryEntry[];
  publicationsPatents?: PublicationPatentEntry[];
  certificates?: CertificateEntry[];
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
