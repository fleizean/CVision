using CVisionBackend.Application.Repositories.CVAnalysisResult;
using CVisionBackend.Persistence.Contexts;

namespace CVisionBackend.Persistence.Repositories.CVAnalysisResult
{
    public class CVAnalysisResultWriteRepository : WriteRepository<Domain.Entities.CVAnalysisResult>, ICVAnalysisResultWriteRepository
    {
        public CVAnalysisResultWriteRepository(CVisionDbContext context) : base(context)
        {
        }
    }
}