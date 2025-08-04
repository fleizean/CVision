using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.User
{
    public class GetByRoleUserFilter
    {
        public List<string> RoleName { get; set; }
    }
}