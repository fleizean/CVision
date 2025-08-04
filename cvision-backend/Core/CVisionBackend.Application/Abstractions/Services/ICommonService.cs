using CVisionBackend.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface ICommonService
    { 
        Guid GetSchoolIdFromUser();
        string GetUserRoleFromUser();
        string GetUserIdFromUser();
    }
}