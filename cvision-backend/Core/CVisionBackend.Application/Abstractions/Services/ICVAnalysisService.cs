using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.CVAnalysis;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface ICVAnalysisService
    {
        Task<CommonResponseMessage<CreateAnalysisResponseDTO>> AnalyzeCVAsync(AnalyzeCVDTO analyzeCVDTO);
        Task<CommonResponseMessage<GetAnalysisResultDTO>> GetAnalysisResultAsync(Guid fileId);
        Task<CommonResponseMessage<GetAnalysisResultDTO>> GetAnalysisResultByIdAsync(Guid analysisResultId);
        Task<CommonResponseMessage<List<GetAnalysisResultDTO>>> GetAnalysisResultsByScoreRangeAsync(int minScore, int maxScore);
        Task<CommonResponseMessage<List<GetAnalysisResultDTO>>> GetAllAnalysisResultsAsync();
        Task<CommonResponseMessage<object>> RetryAnalysisAsync(Guid fileId);
        Task<CommonResponseMessage<object>> DeleteAnalysisResultAsync(Guid analysisResultId);
    }
}