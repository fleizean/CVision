export interface CVJobMatch {
  cvId: string;
  jobProfileId: string;
  cvTitle: string;
  jobTitle: string;
  matchPercentage: number;
  totalJobKeywords: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  extraKeywords: string[];
}

export interface CVAllJobsMatch {
  CVId: string;
  CVTitle: string;
  TotalJobProfiles: number;
  Matches: JobProfileMatch[];
  BestMatch: JobProfileMatch | null;
  AverageMatchPercentage: number;
}

export interface JobProfileMatch {
  JobProfileId: string;
  JobTitle: string;
  MatchPercentage: number;
  TotalJobKeywords: number;
  MatchedKeywordsCount: number;
  MatchedKeywords: string[];
  MissingKeywords: string[];
}

export interface TopCVMatches {
  jobProfileId: string;
  jobTitle: string;
  totalCVsAnalyzed: number;
  topMatches: CVMatch[];
  averageMatchPercentage: number;
}

export interface CVMatch {
  cvId: string;
  cvFileName: string;
  matchPercentage: number;
  totalJobKeywords: number;
  matchedKeywordsCount: number;
  matchedKeywords: string[];
  analysisDate: Date;
}

export interface CVMatchingResponse<T> {
  StatusCode: number;
  Message: string;
  Data: T;
}