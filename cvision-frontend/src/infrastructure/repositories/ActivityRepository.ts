import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface ActivityType {
  UserRegistered: number;
  UserLogin: number;
  UserLogout: number;
  CVFileUploaded: number;
  CVAnalysisStarted: number;
  CVAnalysisCompleted: number;
  CVAnalysisFailed: number;
  JobProfileCreated: number;
  JobProfileUpdated: number;
  JobProfileDeleted: number;
  CVMatchingPerformed: number;
  UserStatusChanged: number;
  FileDeleted: number;
  SystemMaintenance: number;
  SecurityAlert: number;
}

export interface Activity {
  Id: string;
  UserId: string;
  UserName: string;
  UserEmail: string;
  Type: keyof ActivityType;
  TypeName: string;
  Description: string;
  Details?: string;
  EntityId?: string;
  EntityType?: string;
  Timestamp: string;
  IpAddress?: string;
  TimeAgo: string;
}

export interface CreateActivityRequest {
  UserId: string;
  UserName: string;
  UserEmail: string;
  Type: keyof ActivityType;
  Description: string;
  Details?: string;
  EntityId?: string;
  EntityType?: string;
  IpAddress?: string;
  UserAgent?: string;
}

export interface ActivityApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: Activity[] | Activity | { ActivityId: string } | null;
}

export class ActivityRepository {
  async getRecentActivities(count: number = 10): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ActivityApiResponse>(API_ENDPOINTS.ACTIVITY.RECENT(count));
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getUserActivities(userId: string, count: number = 20): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ActivityApiResponse>(API_ENDPOINTS.ACTIVITY.USER(userId, count));
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  async getActivitiesByType(type: keyof ActivityType, count: number = 20): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ActivityApiResponse>(API_ENDPOINTS.ACTIVITY.TYPE(type, count));
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      return [];
    }
  }

  async getActivities(page: number = 1, pageSize: number = 50): Promise<Activity[]> {
    try {
      const response = await apiClient.get<ActivityApiResponse>(API_ENDPOINTS.ACTIVITY.PAGINATED(page, pageSize));
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async logActivity(activityData: CreateActivityRequest): Promise<string | null> {
    try {
      const response = await apiClient.post<ActivityApiResponse>(API_ENDPOINTS.ACTIVITY.BASE, activityData);
      if (response.Data && typeof response.Data === 'object' && 'ActivityId' in response.Data) {
        return response.Data.ActivityId;
      }
      return null;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }
}

export const activityRepository = new ActivityRepository();