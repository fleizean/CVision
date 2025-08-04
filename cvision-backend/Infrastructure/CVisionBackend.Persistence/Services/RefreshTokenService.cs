using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.Repositories.RefreshToken;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRefreshTokenReadRepository _refreshTokenReadRepository;
        private readonly IRefreshTokenWriteRepository _refreshTokenWriteRepository;

        public RefreshTokenService(
            IRefreshTokenReadRepository refreshTokenReadRepository,
            IRefreshTokenWriteRepository refreshTokenWriteRepository)
        {
            _refreshTokenReadRepository = refreshTokenReadRepository;
            _refreshTokenWriteRepository = refreshTokenWriteRepository;
        }

        public async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string? ipAddress = null)
        {
            var refreshToken = new RefreshToken
            {
                Token = GenerateRefreshTokenString(),
                Expires = DateTime.UtcNow.AddDays(7), // 7 days
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress ?? "Unknown",
                ReplacedByToken = "",
                RevokedByIp = "",
                UserId = userId
            };

            await _refreshTokenWriteRepository.AddAsync(refreshToken);
            await _refreshTokenWriteRepository.SaveAsync();

            return refreshToken;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _refreshTokenReadRepository.GetByTokenAsync(token, false);
        }

        public async Task<RefreshToken?> GetByTokenWithUserAsync(string token)
        {
            return await _refreshTokenReadRepository.GetByTokenWithUserAsync(token, false);
        }

        public async Task<bool> ValidateRefreshTokenAsync(string token)
        {
            var refreshToken = await GetByTokenAsync(token);
            return refreshToken?.IsActive == true;
        }

        public async Task RevokeRefreshTokenAsync(string token, string? revokedByIp = null)
        {
            var refreshToken = await _refreshTokenReadRepository.GetByTokenAsync(token);
            if (refreshToken != null && refreshToken.IsActive)
            {
                refreshToken.Revoked = DateTime.UtcNow;
                refreshToken.RevokedByIp = revokedByIp ?? "Unknown";
                
                _refreshTokenWriteRepository.Update(refreshToken);
                await _refreshTokenWriteRepository.SaveAsync();
            }
        }

        public async Task RevokeAllUserTokensAsync(Guid userId)
        {
            var activeTokens = await _refreshTokenReadRepository.GetActiveTokensByUserIdAsync(userId);
            
            foreach (var token in activeTokens)
            {
                token.Revoked = DateTime.UtcNow;
                token.RevokedByIp = token.RevokedByIp ?? "System";
                _refreshTokenWriteRepository.Update(token);
            }
            
            if (activeTokens.Count > 0)
            {
                await _refreshTokenWriteRepository.SaveAsync();
            }
        }

        public async Task<bool> SaveTokenAsync(RefreshToken refreshToken)
        {
            await _refreshTokenWriteRepository.AddAsync(refreshToken);
            var result = await _refreshTokenWriteRepository.SaveAsync();
            return result > 0;
        }

        public async Task<bool> UpdateTokenAsync(RefreshToken refreshToken)
        {
            _refreshTokenWriteRepository.Update(refreshToken);
            var result = await _refreshTokenWriteRepository.SaveAsync();
            return result > 0;
        }

        public string GenerateRefreshTokenString()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var randomBytes = new byte[32];
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
    }
}