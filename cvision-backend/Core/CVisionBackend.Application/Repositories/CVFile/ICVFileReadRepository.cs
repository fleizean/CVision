using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Repositories.CVFile
{
    public interface ICVFileReadRepository : IReadRepository<Domain.Entities.CVFile>
    {
        Task<List<Domain.Entities.CVFile>> GetFilesByUserIdAsync(Guid userId, bool tracking = true);
        Task<List<Domain.Entities.CVFile>> GetFilesByStatusAsync(string status, bool tracking = true);
        Task<Domain.Entities.CVFile?> GetFileWithAnalysisAsync(Guid fileId, bool tracking = true);
    }
}