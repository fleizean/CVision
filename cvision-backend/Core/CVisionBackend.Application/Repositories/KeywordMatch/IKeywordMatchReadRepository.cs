using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories.KeywordMatch
{
    public interface IKeywordMatchReadRepository : IReadRepository<Domain.Entities.KeywordMatch>
    {
        Task<List<Domain.Entities.KeywordMatch>> GetByAnalysisResultIdAsync(Guid analysisResultId, bool tracking = true);
        Task<List<Domain.Entities.KeywordMatch>> GetMatchedKeywordsAsync(bool tracking = true);
        Task<List<Domain.Entities.KeywordMatch>> GetUnmatchedKeywordsAsync(bool tracking = true);
    }
}