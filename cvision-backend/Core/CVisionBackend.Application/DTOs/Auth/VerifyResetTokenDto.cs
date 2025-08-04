using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Auth
{
    public class VerifyResetTokenDto
    {
        public string resetToken { get; set; }
        public Guid userId { get; set; }
    }
}