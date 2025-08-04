export interface CVFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  userId: string;
}

export interface JobProfile {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  department: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
}

export interface KeywordMatch {
  id: string;
  keyword: string;
  matchType: 'Required' | 'Preferred' | 'Bonus';
  foundInSection: string;
  confidence: number;
  context: string;
}

export interface CVAnalysisResult {
  id: string;
  cvFileId: string;
  jobProfileId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  keywordMatches: KeywordMatch[];
  recommendations: string[];
  missingSkills: string[];
  strengths: string[];
  analyzedAt: string;
  cvFile: CVFile;
  jobProfile: JobProfile;
}

export interface AnalyzeCVRequest {
  cvFileId: string;
  jobProfileId: string;
}

export interface UploadCVRequest {
  file: File;
}