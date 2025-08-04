using CVisionBackend.Application.Repositories.KeywordMatch;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories.KeywordMatch
{
    public class KeywordMatchReadRepository : ReadRepository<Domain.Entities.KeywordMatch>, IKeywordMatchReadRepository
    {
        public KeywordMatchReadRepository(CVisionDbContext context) : base(context)
        {
        }

        public async Task<List<Domain.Entities.KeywordMatch>> GetByAnalysisResultIdAsync(Guid analysisResultId, bool tracking = true)
        {
            var query = Table.Where(km => km.CVAnalysisResultId == analysisResultId);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<Domain.Entities.KeywordMatch>> GetMatchedKeywordsAsync(bool tracking = true)
        {
            var query = Table.Where(km => km.IsMatched);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<Domain.Entities.KeywordMatch>> GetUnmatchedKeywordsAsync(bool tracking = true)
        {
            var query = Table.Where(km => !km.IsMatched);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }
    }
}