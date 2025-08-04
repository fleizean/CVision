using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Role
{
    public class AssignRoleDTO
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
    }
}