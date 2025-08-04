using CVisionBackend.Application.Repositories.JobProfile;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories.JobProfile
{
    public class JobProfileReadRepository : ReadRepository<Domain.Entities.JobProfile>, IJobProfileReadRepository
    {
        public JobProfileReadRepository(CVisionDbContext context) : base(context)
        {
        }

        public async Task<List<Domain.Entities.JobProfile>> GetByTitleAsync(string title, bool tracking = true)
        {
            var query = Table.Where(jp => jp.Title.Contains(title));
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<List<Domain.Entities.JobProfile>> GetRecentProfilesAsync(int count = 10, bool tracking = true)
        {
            var query = Table.OrderByDescending(jp => jp.CreatedAt).Take(count);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }
    }
}