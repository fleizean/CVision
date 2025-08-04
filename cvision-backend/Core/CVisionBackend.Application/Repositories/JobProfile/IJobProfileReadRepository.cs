using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories.JobProfile
{
    public interface IJobProfileReadRepository : IReadRepository<Domain.Entities.JobProfile>
    {
        Task<List<Domain.Entities.JobProfile>> GetByTitleAsync(string title, bool tracking = true);
        Task<List<Domain.Entities.JobProfile>> GetRecentProfilesAsync(int count = 10, bool tracking = true);
    }
}