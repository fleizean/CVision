using CVisionBackend.Application.Repositories.JobProfile;
using CVisionBackend.Persistence.Contexts;

namespace CVisionBackend.Persistence.Repositories.JobProfile
{
    public class JobProfileWriteRepository : WriteRepository<Domain.Entities.JobProfile>, IJobProfileWriteRepository
    {
        public JobProfileWriteRepository(CVisionDbContext context) : base(context)
        {
        }
    }
}