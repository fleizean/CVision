using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Persistence.Contexts;

namespace CVisionBackend.Persistence.Repositories.CVFile
{
    public class CVFileWriteRepository : WriteRepository<Domain.Entities.CVFile>, ICVFileWriteRepository
    {
        public CVFileWriteRepository(CVisionDbContext context) : base(context)
        {
        }
    }
}