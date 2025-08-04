using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories.CVFile
{
    public class CVFileReadRepository : ReadRepository<Domain.Entities.CVFile>, ICVFileReadRepository
    {
        public CVFileReadRepository(CVisionDbContext context) : base(context)
        {
        }

        public async Task<List<Domain.Entities.CVFile>> GetFilesByUserIdAsync(Guid userId, bool tracking = true)
        {
            var query = Table.Where(f => f.UserId == userId).Include(f => f.AnalysisResult);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<Domain.Entities.CVFile>> GetFilesByStatusAsync(string status, bool tracking = true)
        {
            var query = Table.Where(f => f.AnalysisStatus == status);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<Domain.Entities.CVFile?> GetFileWithAnalysisAsync(Guid fileId, bool tracking = true)
        {
            var query = Table.Include(f => f.AnalysisResult)
                           .ThenInclude(ar => ar.KeywordMatches)
                           .Where(f => f.Id == fileId);
            
            return tracking ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
        }
    }
}