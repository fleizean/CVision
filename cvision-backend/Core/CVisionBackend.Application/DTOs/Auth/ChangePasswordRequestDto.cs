using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Auth
{
    public class ChangePasswordRequestDto
    {
        public Guid userId { get; set; }
        public string resetToken { get; set; }
        public string newPassword { get; set; }
    }
}