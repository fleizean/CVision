import { apiClient } from '../api/client';

export interface AnalyticsOverview {
  TotalUsers: number;
  TotalCVFiles: number;
  TotalAnalyses: number;
  AvgAnalysisScore: number;
  UserGrowthRate: number;
  FileUploadRate: number;
}

export interface AnalysisStats {
  Completed: number;
  Pending: number;
  Failed: number;
  AvgProcessingTime: number;
}

export interface UserActivity {
  ActiveUsers: number;
  NewUsersThisMonth: number;
  ReturningUsers: number;
}

export interface ScoreDistribution {
  Excellent: number; // 90-100
  Good: number;      // 75-89
  Average: number;   // 60-74
  Poor: number;      // 0-59
}

export interface MonthlyData {
  Month: string;
  Users: number;
  Uploads: number;
  Analyses: number;
}

export interface TopKeyword {
  Keyword: string;
  Count: number;
}

export interface AnalyticsData {
  Overview: AnalyticsOverview;
  AnalysisStats: AnalysisStats;
  UserActivity: UserActivity;
  ScoreDistribution: ScoreDistribution;
  MonthlyData: MonthlyData[];
  TopKeywords: TopKeyword[];
}

export interface AnalyticsApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: AnalyticsData;
}

export class AnalyticsRepository {
  async getAnalyticsData(timeRange: string = '30days'): Promise<AnalyticsData> {
    try {
      const response = await apiClient.get<AnalyticsApiResponse>(`/api/Analytics?timeRange=${timeRange}`);
      return response.Data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}

export const analyticsRepository = new AnalyticsRepository();