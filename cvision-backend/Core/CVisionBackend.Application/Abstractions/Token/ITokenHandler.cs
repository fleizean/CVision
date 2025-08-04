using CVisionBackend.Application.DTOs.TokenDTO;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Token
{
    public interface ITokenHandler
    {
        Task<TokenDTO> CreateAccessToken(AppUser appUser);
        Task<TokenDTO> RefreshAccessToken(string refreshToken);
    }
}
