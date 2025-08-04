import { IJobProfileRepository } from '../../core/ports/repositories/IJobProfileRepository';
import { JobProfile, CreateJobProfileDto, UpdateJobProfileDto, JobProfileResponse, JobProfileListResponse } from '../../core/domain/entities/JobProfile';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export class JobProfileRepository implements IJobProfileRepository {
  async getAll(): Promise<JobProfileListResponse> {
    const response = await apiClient.get<any>(API_ENDPOINTS.JOB_PROFILE.LIST);
    
    // Transform the response to match our frontend interface
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data?.map(this.mapJobProfileFromBackend) || []
    };
  }

  async getById(id: string): Promise<JobProfileResponse> {
    const response = await apiClient.get<any>(API_ENDPOINTS.JOB_PROFILE.DETAIL(id));
    
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data ? this.mapJobProfileFromBackend(response.Data) : null
    };
  }

  async create(data: CreateJobProfileDto): Promise<JobProfileResponse> {
    const response = await apiClient.post<any>(API_ENDPOINTS.JOB_PROFILE.CREATE, data);
    
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data ? this.mapJobProfileFromBackend(response.Data) : null
    };
  }

  async update(data: UpdateJobProfileDto): Promise<JobProfileResponse> {
    const response = await apiClient.put<any>(API_ENDPOINTS.JOB_PROFILE.UPDATE, data);
    
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data ? this.mapJobProfileFromBackend(response.Data) : null
    };
  }

  async delete(id: string): Promise<{ statusCode: number; message: string; }> {
    const response = await apiClient.delete<any>(API_ENDPOINTS.JOB_PROFILE.DELETE(id));
    
    return {
      statusCode: response.StatusCode,
      message: response.Message
    };
  }

  async getByTitle(title: string): Promise<JobProfileListResponse> {
    const response = await apiClient.get<any>(API_ENDPOINTS.JOB_PROFILE.BY_TITLE(title));
    
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data?.map(this.mapJobProfileFromBackend) || []
    };
  }

  async getRecent(count: number = 10): Promise<JobProfileListResponse> {
    const response = await apiClient.get<any>(API_ENDPOINTS.JOB_PROFILE.RECENT(count));
    
    return {
      Title: response.Title,
      Message: response.Message,
      StatusCode: response.StatusCode,
      Data: response.Data?.map(this.mapJobProfileFromBackend) || []
    };
  }

  async getJobProfiles(page: number = 0, size: number = 50): Promise<{ jobProfiles: JobProfile[], totalCount: number }> {
    try {
      const response = await this.getAll();
      
      if (response.StatusCode === 200 && response.Data) {
        // Since the backend doesn't support pagination yet, we'll handle it client-side
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedData = response.Data.slice(startIndex, endIndex);
        
        return {
          jobProfiles: paginatedData,
          totalCount: response.Data.length
        };
      }
      
      return { jobProfiles: [], totalCount: 0 };
    } catch (error) {
      console.error('Error fetching job profiles:', error);
      return { jobProfiles: [], totalCount: 0 };
    }
  }
  
  // Helper method to map backend properties to frontend properties
  private mapJobProfileFromBackend(item: any): JobProfile {
    return {
      id: item.Id,
      title: item.Title,
      suggestedKeywords: item.SuggestedKeywords || [],
      createdAt: item.CreatedAt
    };
  }
}

export const jobProfileRepository = new JobProfileRepository();