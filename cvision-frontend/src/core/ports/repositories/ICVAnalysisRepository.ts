import { CVFile, CVAnalysisResult, AnalyzeCVRequest, UploadCVRequest } from '../../domain/entities/CVAnalysis';

export interface ICVAnalysisRepository {
  uploadCV(request: UploadCVRequest): Promise<CVFile>;
  analyzeCV(request: AnalyzeCVRequest): Promise<CVAnalysisResult>;
  getAnalysisResults(userId: string): Promise<CVAnalysisResult[]>;
  getAnalysisHistory(userId: string, page?: number, pageSize?: number): Promise<{
    data: CVAnalysisResult[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>;
  getAnalysisById(id: string): Promise<CVAnalysisResult>;
}