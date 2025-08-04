import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface CVAnalysisResult {
  Id: string;
  FileId: string;
  AnalysisStatus: 'Completed' | 'Pending' | 'Failed';
  OverallScore: number;
  CreatedAt: string;
  UpdatedAt: string;
  KeywordMatches: any[];
}

export interface CVAnalysisStats {
  totalAnalyses: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  failedAnalyses: number;
  avgScore: number;
}

export interface CVAnalysisApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: CVAnalysisResult[];
}

export class CVAnalysisRepository {
  async getAllAnalysisResults(): Promise<CVAnalysisResult[]> {
    try {
      const response = await apiClient.get<CVAnalysisApiResponse>('/api/CVAnalysis/results');
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching CV analysis results:', error);
      return [];
    }
  }

  async getAnalysisStats(): Promise<CVAnalysisStats> {
    try {
      const results = await this.getAllAnalysisResults();
      
      const completedAnalyses = results.filter(r => r.AnalysisStatus === 'Completed');
      const pendingAnalyses = results.filter(r => r.AnalysisStatus === 'Pending');
      const failedAnalyses = results.filter(r => r.AnalysisStatus === 'Failed');
      
      // Calculate average score from completed analyses
      const avgScore = completedAnalyses.length > 0 
        ? completedAnalyses.reduce((sum, r) => sum + r.OverallScore, 0) / completedAnalyses.length
        : 0;

      return {
        totalAnalyses: results.length,
        completedAnalyses: completedAnalyses.length,
        pendingAnalyses: pendingAnalyses.length,
        failedAnalyses: failedAnalyses.length,
        avgScore: Math.round(avgScore * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      console.error('Error calculating analysis stats:', error);
      return {
        totalAnalyses: 0,
        completedAnalyses: 0,
        pendingAnalyses: 0,
        failedAnalyses: 0,
        avgScore: 0
      };
    }
  }

  async getAnalysisResult(fileId: string): Promise<CVAnalysisResult | null> {
    try {
      const response = await apiClient.get<CVAnalysisApiResponse>(`/api/CVAnalysis/result/${fileId}`);
      return response.Data?.[0] || null;
    } catch (error) {
      console.error('Error fetching analysis result:', error);
      return null;
    }
  }
}

export const cvAnalysisRepository = new CVAnalysisRepository();