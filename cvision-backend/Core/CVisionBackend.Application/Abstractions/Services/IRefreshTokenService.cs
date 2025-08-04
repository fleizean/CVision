using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IRefreshTokenService
    {
        Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string? ipAddress = null);
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<bool> ValidateRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token, string? revokedByIp = null);
        Task RevokeAllUserTokensAsync(Guid userId);
        Task<RefreshToken?> GetByTokenWithUserAsync(string token);
        Task<bool> SaveTokenAsync(RefreshToken refreshToken);
        Task<bool> UpdateTokenAsync(RefreshToken refreshToken);
        string GenerateRefreshTokenString();
    }
}