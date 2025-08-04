using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.User
{
    public class GetListUser
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
    }
}