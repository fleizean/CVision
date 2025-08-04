using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Role
{
    public class UserRolesDTO
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public List<GetRole> Roles { get; set; } = new List<GetRole>();
    }
}