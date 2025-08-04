using CVisionBackend.Application.Repositories.RefreshToken;
using CVisionBackend.Domain.Entities.Identity;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Repositories.RefreshToken
{
    public class RefreshTokenReadRepository : ReadRepository<Domain.Entities.Identity.RefreshToken>, IRefreshTokenReadRepository
    {
        public RefreshTokenReadRepository(CVisionDbContext context) : base(context)
        {
        }

        public async Task<Domain.Entities.Identity.RefreshToken?> GetByTokenAsync(string token, bool tracking = true)
        {
            var query = Table.Where(rt => rt.Token == token);
            return tracking ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<List<Domain.Entities.Identity.RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId, bool tracking = true)
        {
            var query = Table.Where(rt => rt.UserId == userId && rt.Revoked == null && rt.Expires > DateTime.UtcNow);
            return tracking ? await query.ToListAsync() : await query.AsNoTracking().ToListAsync();
        }

        public async Task<Domain.Entities.Identity.RefreshToken?> GetByTokenWithUserAsync(string token, bool tracking = true)
        {
            var query = Table.Include(rt => rt.User).Where(rt => rt.Token == token);
            return tracking ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
        }
    }
}