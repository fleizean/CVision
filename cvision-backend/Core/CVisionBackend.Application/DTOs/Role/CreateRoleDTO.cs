using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Role
{
    public class CreateRoleDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
    }
}