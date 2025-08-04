using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.Abstractions.Token;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.TokenDTO;
using CVisionBackend.Application.DTOs.User;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using CVisionBackend.Application.DTOs.Auth;
using CVisionBackend.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace CVisionBackend.Persistence.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ITokenHandler _tokenHandler;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IActivityService _activityService;

        public AuthService(IConfiguration configuration, ITokenHandler tokenHandler, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IHttpContextAccessor httpContextAccessor, IActivityService activityService)
        {
            _configuration = configuration;
            _tokenHandler = tokenHandler;
            _userManager = userManager;
            _signInManager = signInManager;
            _httpContextAccessor = httpContextAccessor;
            _activityService = activityService;
        }

        public async Task<CommonResponseMessage<TokenDTO>> LoginAsync(LoginDTO login)
        {
            AppUser user = await _userManager.FindByNameAsync(login.Email);
            if (user == null)
                user = await _userManager.FindByEmailAsync(login.Email);
            if (user == null)
                return new CommonResponseMessage<TokenDTO>()
                {
                    Message = "User not found with this information.",
                    Title = "User Login",
                    StatusCode = HttpStatusCode.NotFound
                };
            // Check if user account is active (not locked out)
            var isUserActive = !user.LockoutEnd.HasValue || user.LockoutEnd <= DateTimeOffset.UtcNow;
            if (!isUserActive)
            {
                return new CommonResponseMessage<TokenDTO>()
                {
                    Message = "Your account has been suspended by the administrator.",
                    Title = "Account Suspended",
                    StatusCode = HttpStatusCode.Forbidden
                };
            }

            SignInResult result = await _signInManager.CheckPasswordSignInAsync(user, login.Password, true);
            if (result.Succeeded)
            {
                TokenDTO tokenDTO = await _tokenHandler.CreateAccessToken(user);
                
                // Log login activity
                var request = _httpContextAccessor.HttpContext?.Request;
                var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
                var userAgent = request?.Headers["User-Agent"].ToString();
                
                await _activityService.LogUserActivityAsync(
                    user.Id,
                    $"{user.Name} {user.Surname}",
                    user.Email,
                    ActivityType.UserLogin,
                    "User logged in successfully",
                    System.Text.Json.JsonSerializer.Serialize(new { LoginTime = DateTime.UtcNow, IpAddress = ipAddress }),
                    user.Id.ToString(),
                    "User",
                    ipAddress,
                    userAgent
                );
                
                return new CommonResponseMessage<TokenDTO>()
                {
                    Title = "User Login",
                    Message = "Successfully logged in.",
                    StatusCode = HttpStatusCode.OK,
                    Data = tokenDTO
                };
            }
            else
            {
                return new CommonResponseMessage<TokenDTO>()
                {
                    Title = "User Login",
                    Message = "User information not found or incorrect.",
                    StatusCode = HttpStatusCode.Unauthorized
                };
            }
        }

        public async Task<CommonResponseMessage<object>> PasswordResetAsync(string email)
        {
            AppUser user = await _userManager.FindByEmailAsync(email);
            
            if (user == null)
                return new CommonResponseMessage<object>
                {
                    Title = "Password Reset",
                    Message = "No user found with this email address.",
                    StatusCode = HttpStatusCode.NotFound
                };

            string resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // In a real application, you would send this token via email
            // For now, we just return it in the response
            return new CommonResponseMessage<object>
            {
                Title = "Password Reset",
                Message = "Password reset link has been sent to your email address.",
                StatusCode = HttpStatusCode.OK,
                Data = new { ResetToken = resetToken, Email = email }
            };
        }

        public async Task<CommonResponseMessage<TokenDTO>> RefreshTokenLoginAsync(string refreshToken)
        {
            TokenDTO token = await _tokenHandler.RefreshAccessToken(refreshToken);
            
            if (token == null)
                return new CommonResponseMessage<TokenDTO>
                {
                    Title = "Token Refresh",
                    Message = "Invalid refresh token.",
                    StatusCode = HttpStatusCode.BadRequest
                };
            
            return new CommonResponseMessage<TokenDTO>
            {
                Title = "Token Refresh",
                Message = "Token successfully refreshed.",
                StatusCode = HttpStatusCode.OK,
                Data = token
            };
        }

        public async Task<CommonResponseMessage<object>> VerifyResetTokenAsync(VerifyResetTokenDto verifyResetTokenDto)
        {
            AppUser user = await _userManager.FindByIdAsync(verifyResetTokenDto.userId.ToString());
            
            if (user == null)
            return new CommonResponseMessage<object>
            {
                Title = "Token Verification",
                Message = "User not found.",
                StatusCode = HttpStatusCode.NotFound
            };

            bool isValid = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", verifyResetTokenDto.resetToken);
            
            if (!isValid)
            return new CommonResponseMessage<object>
            {
                Title = "Token Verification",
                Message = "Invalid or expired token.",
                StatusCode = HttpStatusCode.BadRequest
            };

            return new CommonResponseMessage<object>
            {
            Title = "Token Verification",
            Message = "Token verified.",
            StatusCode = HttpStatusCode.OK
            };
        }

        public async Task<CommonResponseMessage<object>> ChangePasswordAsync(ChangePasswordRequestDto request)
        {
            AppUser user = await _userManager.FindByIdAsync(request.userId.ToString());
            
            if (user == null)
            return new CommonResponseMessage<object>
            {
                Title = "Password Change",
                Message = "User not found.",
                StatusCode = HttpStatusCode.NotFound
            };
            
            IdentityResult result = await _userManager.ResetPasswordAsync(user, request.resetToken, request.newPassword);
            
            if (!result.Succeeded)
            return new CommonResponseMessage<object>
            {
                Title = "Password Change",
                Message = "Password change failed: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                StatusCode = HttpStatusCode.BadRequest
            };
            
            return new CommonResponseMessage<object>
            {
            Title = "Password Change",
            Message = "Password successfully changed.",
            StatusCode = HttpStatusCode.OK
            };
        }

        public async Task<CommonResponseMessage<object>> RegisterAsync(CreateUserDTO createUserDTO)
        {
            AppUser user = new()
            {
                UserName = createUserDTO.Email,
                Email = createUserDTO.Email,
                Name = createUserDTO.Name,
                Surname = createUserDTO.Surname
            };
            
            IdentityResult result = await _userManager.CreateAsync(user, createUserDTO.Password);

            if (result.Succeeded)
            {
                const string defaultRole = "User";

                var isInRole = await _userManager.IsInRoleAsync(user, defaultRole);
                if (!isInRole)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, defaultRole);
                    if (!roleResult.Succeeded)
                    {
                        // Optional: Log the error
                        // You might also want to handle this error gracefully
                        return new CommonResponseMessage<object>
                        {
                            Message = "User created, but role assignment failed.",
                            Title = "Role Assignment",
                            StatusCode = HttpStatusCode.InternalServerError
                        };
                    }
                }

                // Log registration activity
                var request = _httpContextAccessor.HttpContext?.Request;
                var ipAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
                var userAgent = request?.Headers["User-Agent"].ToString();
                
                await _activityService.LogUserActivityAsync(
                    user.Id,
                    $"{user.Name} {user.Surname}",
                    user.Email ?? string.Empty,
                    ActivityType.UserRegistered,
                    "New user account created",
                    System.Text.Json.JsonSerializer.Serialize(new { RegistrationTime = DateTime.UtcNow, Email = user.Email }),
                    user.Id.ToString(),
                    "User",
                    ipAddress,
                    userAgent
                );
            }

            
            if (!result.Succeeded)
                return new CommonResponseMessage<object>
                {
                    Title = "User Registration",
                    Message = "Registration failed: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                    StatusCode = HttpStatusCode.BadRequest
                };
            
            return new CommonResponseMessage<object>
            {
                Title = "User Registration",
                Message = "User successfully created.",
                StatusCode = HttpStatusCode.Created
            };
        }

        public async Task<CommonResponseMessage<object>> GetCurrentUserAsync()
        {
            // Get the user ID from claims since we store it as "UserId" in the token
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;
            
            // Find user by ID which is more reliable than using the name
            AppUser user = userId != null
                ? await _userManager.FindByIdAsync(userId)
                : null;

            if (user == null)
            {
                return await Task.FromResult(new CommonResponseMessage<object>
                {
                    Title = "Get Current User",
                    Message = "No user is currently logged in.",
                    StatusCode = HttpStatusCode.Unauthorized
                });
            }

            // Get User Roles
            var roles = await _userManager.GetRolesAsync(user);
            if (roles == null || !roles.Any())
            {
                return await Task.FromResult(new CommonResponseMessage<object>
                {
                    Title = "Get Current User",
                    Message = "User has no roles assigned.",
                    StatusCode = HttpStatusCode.NotFound
                });
            }


            var userDto = new GetUserDTO
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Roles = roles.ToList()
            };

            return await Task.FromResult(new CommonResponseMessage<object>
            {
                Title = "Get Current User",
                Message = "Current user retrieved successfully.",
                StatusCode = HttpStatusCode.OK,
                Data = userDto
            });
        }
            
    }
}
