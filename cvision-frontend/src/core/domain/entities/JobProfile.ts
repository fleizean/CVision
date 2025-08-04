export interface JobProfile {
  id: string;
  title: string;
  suggestedKeywords: string[];
  createdAt: Date;
}

export interface CreateJobProfileDto {
  title: string;
  suggestedKeywords: string[];
}

export interface UpdateJobProfileDto {
  id: string;
  title: string;
  suggestedKeywords: string[];
}

export interface ApiResponse<T> {
  Title?: string | null;
  Message: string;
  StatusCode: number; // This is a number in the response, not HttpStatusCode enum
  Data?: T | null;
}

export interface JobProfileResponse extends ApiResponse<JobProfile> {}

export interface JobProfileListResponse extends ApiResponse<JobProfile[]> {}