using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using CVisionBackend.Application.Abstractions.Provide;
using CVisionBackend.Application.Abstractions.Token;
using CVisionBackend.Application.DTOs.TokenDTO;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TimeZoneConverter;
using CVisionBackend.Application.Abstractions.Services;

namespace CVisionBackend.Infrastructure.Services
{
    public class TokenHandler : ITokenHandler
    {
        readonly UserManager<AppUser> _userManager;
        private IConfiguration _configuration;
        private readonly IRefreshTokenService _refreshTokenService;
        
        public TokenHandler(IConfiguration configuration, UserManager<AppUser> userManager, IRefreshTokenService refreshTokenService)
        {
            _configuration = configuration;
            _userManager = userManager;
            _refreshTokenService = refreshTokenService;
        }

        public async Task<TokenDTO> CreateAccessToken(AppUser appUser)
        {
            TokenDTO token = new();
            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Token:SecurityKey"]));
            SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            token.Expiration = DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["Token:Expiration"]));

            var roles = await _userManager.GetRolesAsync(appUser);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, appUser.Email),
                new Claim(ClaimTypes.NameIdentifier, appUser.Name.ToString() + " " + appUser.Surname.ToString()),
                new Claim("UserId", appUser.Id.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            JwtSecurityToken jwtSecurityToken = new(
                   issuer: _configuration["Token:Issuer"],
                   audience: _configuration["Token:Audience"],
                   expires: token.Expiration,
                   notBefore: DateTime.UtcNow,
                   signingCredentials: credentials,
                   claims: claims
                   );
            JwtSecurityTokenHandler tokenHandler = new();
            token.AccessToken = tokenHandler.WriteToken(jwtSecurityToken);
            
            // Revoke old refresh tokens
            await _refreshTokenService.RevokeAllUserTokensAsync(appUser.Id);
            
            // Create new refresh token
            var refreshToken = await _refreshTokenService.CreateRefreshTokenAsync(appUser.Id);
            token.RefreshToken = refreshToken.Token;
            token.RefreshTokenExpiration = refreshToken.Expires;
            
            return token;
        }

        public async Task<TokenDTO> RefreshAccessToken(string refreshToken)
        {
            var storedToken = await _refreshTokenService.GetByTokenWithUserAsync(refreshToken);
            
            if (storedToken == null || !storedToken.IsActive)
                return null;
            
            // Revoke the used refresh token
            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);
            
            // Generate new tokens
            var newTokens = await CreateAccessToken(storedToken.User);
            
            return newTokens;
        }
    }
}
