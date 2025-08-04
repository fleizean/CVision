import { 
  CVJobMatch, 
  CVAllJobsMatch, 
  TopCVMatches, 
  CVMatchingResponse 
} from '../../core/domain/entities/CVMatching';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export class CVMatchingRepository {
  async matchCVWithJob(cvId: string, jobProfileId: string): Promise<CVMatchingResponse<CVJobMatch>> {
    return await apiClient.post<CVMatchingResponse<CVJobMatch>>(
      API_ENDPOINTS.CV_MATCHING.MATCH_WITH_JOB(cvId, jobProfileId)
    );
  }

  async matchCVWithAllJobs(cvId: string): Promise<CVMatchingResponse<CVAllJobsMatch>> {
    return await apiClient.post<CVMatchingResponse<CVAllJobsMatch>>(
      API_ENDPOINTS.CV_MATCHING.MATCH_WITH_ALL_JOBS(cvId)
    );
  }

  async getTopMatchesForJobProfile(jobProfileId: string, limit: number = 10): Promise<CVMatchingResponse<TopCVMatches>> {
    return await apiClient.get<CVMatchingResponse<TopCVMatches>>(
      API_ENDPOINTS.CV_MATCHING.TOP_MATCHES(jobProfileId, limit)
    );
  }
}