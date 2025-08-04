using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories.RefreshToken
{
    public interface IRefreshTokenReadRepository : IReadRepository<Domain.Entities.Identity.RefreshToken>
    {
        Task<Domain.Entities.Identity.RefreshToken?> GetByTokenAsync(string token, bool tracking = true);
        Task<List<Domain.Entities.Identity.RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId, bool tracking = true);
        Task<Domain.Entities.Identity.RefreshToken?> GetByTokenWithUserAsync(string token, bool tracking = true);
    }
}