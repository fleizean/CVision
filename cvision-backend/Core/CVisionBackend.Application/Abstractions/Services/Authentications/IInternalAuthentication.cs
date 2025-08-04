using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.TokenDTO;
using CVisionBackend.Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services.Authentications
{
    public interface IInternalAuthentication
    {
        Task<CommonResponseMessage<TokenDTO>> LoginAsync(LoginDTO login);
        Task<CommonResponseMessage<TokenDTO>> RefreshTokenLoginAsync(string refreshToken);
        Task<CommonResponseMessage<object>> RegisterAsync(CreateUserDTO createUserDTO);
    }
}
