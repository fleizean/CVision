using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories.CVAnalysisResult
{
    public interface ICVAnalysisResultReadRepository : IReadRepository<Domain.Entities.CVAnalysisResult>
    {
        Task<Domain.Entities.CVAnalysisResult?> GetByFileIdAsync(Guid fileId, bool tracking = true);
        Task<List<Domain.Entities.CVAnalysisResult>> GetAnalysisResultsWithKeywordsAsync(bool tracking = true);
        Task<List<Domain.Entities.CVAnalysisResult>> GetResultsByScoreRangeAsync(int minScore, int maxScore, bool tracking = true);
    }
}