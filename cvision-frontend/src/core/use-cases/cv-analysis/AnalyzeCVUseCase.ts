import { ICVAnalysisRepository } from '../../ports/repositories/ICVAnalysisRepository';
import { AnalyzeCVRequest, CVAnalysisResult } from '../../domain/entities/CVAnalysis';

export class AnalyzeCVUseCase {
  constructor(private cvAnalysisRepository: ICVAnalysisRepository) {}

  async execute(request: AnalyzeCVRequest): Promise<CVAnalysisResult> {
    if (!request.cvFileId || !request.jobProfileId) {
      throw new Error('CV file ID and job profile ID are required');
    }

    return await this.cvAnalysisRepository.analyzeCV(request);
  }
}