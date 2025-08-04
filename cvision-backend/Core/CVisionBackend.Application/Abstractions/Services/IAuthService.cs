using CVisionBackend.Application.Abstractions.Services.Authentications;
using CVisionBackend.Application.DTOs.Auth;
using CVisionBackend.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IAuthService : IInternalAuthentication, IExternalAuthentication
    {
        Task<CommonResponseMessage<object>> PasswordResetAsync(string email);
        Task<CommonResponseMessage<object>> VerifyResetTokenAsync(VerifyResetTokenDto verifyResetTokenDto);
        Task<CommonResponseMessage<object>> ChangePasswordAsync(ChangePasswordRequestDto request);
        Task<CommonResponseMessage<object>> GetCurrentUserAsync();
    }
}
