import { apiClient } from '../api/client';

export interface CVFile {
  Id: string;
  UserId: string;
  FileName: string;
  FilePath?: string;
  FileType: string;
  ParsedText?: string;
  AnalysisStatus: 'Pending' | 'Completed' | 'Failed';
  UploadedAt: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  HasAnalysis: boolean;
  AnalysisScore: number | null;
  // User Information (for admin endpoint)
  UserName?: string;
  UserEmail?: string;
  UserFullName?: string;
}

export interface CVFileStats {
  totalFiles: number;
  completedFiles: number;
  pendingFiles: number;
  failedFiles: number;
}

export interface CVFileApiResponse {
  StatusCode: number;
  Message: string;
  Title?: string;
  Data: CVFile[];
}

export class CVFileRepository {
  async getFilesByStatus(status: 'Pending' | 'Completed' | 'Failed'): Promise<CVFile[]> {
    try {
      const response = await apiClient.get<CVFileApiResponse>(`/api/CVFiles/by-status/${status}`);
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error(`Error fetching ${status} CV files:`, error);
      return [];
    }
  }

  async getAllFiles(): Promise<CVFile[]> {
    try {
      // Get files by all statuses and combine them
      const [completedFiles, pendingFiles, failedFiles] = await Promise.all([
        this.getFilesByStatus('Completed'),
        this.getFilesByStatus('Pending'),
        this.getFilesByStatus('Failed')
      ]);

      return [...completedFiles, ...pendingFiles, ...failedFiles];
    } catch (error) {
      console.error('Error fetching all CV files:', error);
      return [];
    }
  }

  async getAllFilesWithUserInfo(): Promise<CVFile[]> {
    try {
      const response = await apiClient.get<CVFileApiResponse>('/api/CVFiles/admin/all-files-with-users');
      return Array.isArray(response.Data) ? response.Data : [];
    } catch (error) {
      console.error('Error fetching CV files with user info:', error);
      return [];
    }
  }

  async getCVFileStats(): Promise<CVFileStats> {
    try {
      const [completedFiles, pendingFiles, failedFiles] = await Promise.all([
        this.getFilesByStatus('Completed'),
        this.getFilesByStatus('Pending'),
        this.getFilesByStatus('Failed')
      ]);

      return {
        totalFiles: completedFiles.length + pendingFiles.length + failedFiles.length,
        completedFiles: completedFiles.length,
        pendingFiles: pendingFiles.length,
        failedFiles: failedFiles.length
      };
    } catch (error) {
      console.error('Error calculating CV file stats:', error);
      return {
        totalFiles: 0,
        completedFiles: 0,
        pendingFiles: 0,
        failedFiles: 0
      };
    }
  }

  async retryAnalysis(fileId: string): Promise<void> {
    try {
      await apiClient.post(`/api/CVAnalysis/retry/${fileId}`);
    } catch (error) {
      console.error('Error retrying analysis:', error);
      throw error;
    }
  }
}

export const cvFileRepository = new CVFileRepository();