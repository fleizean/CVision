using CVisionBackend.Application.Repositories.KeywordMatch;
using CVisionBackend.Persistence.Contexts;

namespace CVisionBackend.Persistence.Repositories.KeywordMatch
{
    public class KeywordMatchWriteRepository : WriteRepository<Domain.Entities.KeywordMatch>, IKeywordMatchWriteRepository
    {
        public KeywordMatchWriteRepository(CVisionDbContext context) : base(context)
        {
        }
    }
}