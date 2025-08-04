using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.User
{
    public class GetUserDTO
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        
        // Backward compatibility - returns first role or null
        public string? RoleName { get; set; }
        public Guid RoleId { get; set; } // Keep for backward compatibility if needed
    }
}