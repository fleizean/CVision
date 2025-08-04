using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Role
{
    public class GetRole
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}