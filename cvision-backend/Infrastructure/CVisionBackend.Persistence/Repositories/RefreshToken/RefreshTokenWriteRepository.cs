using CVisionBackend.Application.Repositories.RefreshToken;
using CVisionBackend.Persistence.Contexts;

namespace CVisionBackend.Persistence.Repositories.RefreshToken
{
    public class RefreshTokenWriteRepository : WriteRepository<Domain.Entities.Identity.RefreshToken>, IRefreshTokenWriteRepository
    {
        public RefreshTokenWriteRepository(CVisionDbContext context) : base(context)
        {
        }
    }
}