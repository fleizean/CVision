using CVisionBackend.Application.Repositories.CVAnalysisResult;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories.CVAnalysisResult
{
    public class CVAnalysisResultReadRepository : ReadRepository<Domain.Entities.CVAnalysisResult>, ICVAnalysisResultReadRepository
    {
        public CVAnalysisResultReadRepository(CVisionDbContext context) : base(context)
        {
        }

        public async Task<Domain.Entities.CVAnalysisResult?> GetByFileIdAsync(Guid fileId, bool tracking = true)
        {
            var query = Table.Where(ar => ar.CVFileId == fileId);
            return tracking ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<List<Domain.Entities.CVAnalysisResult>> GetAnalysisResultsWithKeywordsAsync(bool tracking = true)
        {
            var query = Table.Include(ar => ar.KeywordMatches);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<Domain.Entities.CVAnalysisResult>> GetResultsByScoreRangeAsync(int minScore, int maxScore, bool tracking = true)
        {
            var query = Table.Where(ar => ar.Score >= minScore && ar.Score <= maxScore);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }
    }
}