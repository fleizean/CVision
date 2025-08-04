using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.User;
using CVisionBackend.Domain.Entities.Identity;
using CVisionBackend.Application.Repositories.CVFile;

namespace CVisionBackend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = "admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ICVFileReadRepository _cvFileReadRepository;

        public UserController(IUserService userService, UserManager<AppUser> userManager, ICVFileReadRepository cvFileReadRepository)
        {
            _userService = userService;
            _userManager = userManager;
            _cvFileReadRepository = cvFileReadRepository;
        }

        [HttpGet("admin/users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 0, [FromQuery] int size = 50)
        {
            try
            {
                var pageSize = new PageSizeDTO { Page = page, Size = size };
                var result = await _userService.GetListUsers(pageSize);

                // Get additional user information including CV file counts and last login
                var enrichedUsers = new List<object>();
                
                foreach (var user in result.Lists)
                {
                    var appUser = await _userManager.FindByIdAsync(user.Id.ToString());
                    if (appUser != null)
                    {
                        // Get CV files count for this user
                        var cvFiles = await _cvFileReadRepository.GetFilesByUserIdAsync(user.Id, false);
                        var cvFilesCount = cvFiles?.Count() ?? 0;

                        enrichedUsers.Add(new
                        {
                            Id = user.Id.ToString(),
                            Name = user.Name,
                            Surname = user.Surname,
                            Email = user.Email,
                            UserName = appUser.UserName,
                            IsActive = !appUser.LockoutEnd.HasValue || appUser.LockoutEnd <= DateTimeOffset.UtcNow,
                            Roles = new[] { user.RoleName ?? "User" },
                            LastLogin = (string?)null, // We'll implement last login tracking later
                            CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"), // Default for now
                            CvFilesCount = cvFilesCount
                        });
                    }
                }

                return Ok(new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Message = "Users retrieved successfully",
                    Data = new
                    {
                        Users = enrichedUsers,
                        TotalCount = result.TotalCount
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving users: {ex.Message}"
                });
            }
        }

        [HttpGet("admin/users/{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            try
            {
                var user = await _userService.GetByIdUser(id);
                if (user == null)
                {
                    return NotFound(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Message = "User not found"
                    });
                }

                var appUser = await _userManager.FindByIdAsync(id.ToString());
                if (appUser != null)
                {
                    var cvFiles = await _cvFileReadRepository.GetFilesByUserIdAsync(id, false);
                    var cvFilesCount = cvFiles?.Count() ?? 0;

                    var enrichedUser = new
                    {
                        Id = user.Id.ToString(),
                        Name = user.Name,
                        Surname = user.Surname,
                        Email = user.Email,
                        UserName = appUser.UserName,
                        IsActive = !appUser.LockoutEnd.HasValue || appUser.LockoutEnd <= DateTimeOffset.UtcNow,
                        Roles = user.Roles,
                        LastLogin = (string?)null, // We'll implement last login tracking later
                        CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"), // Default for now
                        CvFilesCount = cvFilesCount
                    };

                    return Ok(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.OK,
                        Message = "User retrieved successfully",
                        Data = enrichedUser
                    });
                }

                return NotFound(new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.NotFound,
                    Message = "User not found"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving user: {ex.Message}"
                });
            }
        }

        [HttpPut("admin/users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null)
                {
                    return NotFound(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Message = "User not found"
                    });
                }

                var isCurrentlyActive = !user.LockoutEnd.HasValue || user.LockoutEnd <= DateTimeOffset.UtcNow;

                if (isCurrentlyActive)
                {
                    // Deactivate user by setting lockout end to a future date
                    user.LockoutEnd = DateTimeOffset.MaxValue;
                }
                else
                {
                    // Activate user by removing lockout
                    user.LockoutEnd = null;
                }

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    var newStatus = !user.LockoutEnd.HasValue || user.LockoutEnd <= DateTimeOffset.UtcNow;
                    return Ok(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.OK,
                        Message = $"User {(newStatus ? "activated" : "deactivated")} successfully",
                        Data = new { IsActive = newStatus }
                    });
                }
                else
                {
                    return BadRequest(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.BadRequest,
                        Message = "Failed to update user status"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error toggling user status: {ex.Message}"
                });
            }
        }

        [HttpPost("admin/users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDTO createUserDTO)
        {
            try
            {
                var result = await _userService.CreateUserAsync(createUserDTO);
                
                if (result.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error creating user: {ex.Message}"
                });
            }
        }

        [HttpPut("admin/users/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDTO updateUserDTO)
        {
            try
            {
                updateUserDTO.Id = id;
                var result = await _userService.UpdateUserAsync(updateUserDTO);
                
                if (result.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error updating user: {ex.Message}"
                });
            }
        }

        [HttpPost("admin/users/{id}/reset-password")]
        public async Task<IActionResult> ResetUserPassword(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null)
                {
                    return NotFound(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Message = "User not found"
                    });
                }

                // Generate a temporary password
                var tempPassword = GenerateTemporaryPassword();
                
                // Reset password
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, tempPassword);

                if (result.Succeeded)
                {
                    // TODO: Send email with temporary password
                    // For now, we'll return the temporary password in the response
                    // In production, this should be sent via email
                    
                    return Ok(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.OK,
                        Message = "Password reset successfully. Temporary password has been generated.",
                        Data = new { TemporaryPassword = tempPassword, 
                                   Note = "In production, this password would be sent via email." }
                    });
                }
                else
                {
                    return BadRequest(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.BadRequest,
                        Message = "Failed to reset password: " + string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error resetting password: {ex.Message}"
                });
            }
        }

        [HttpPost("admin/users/{id}/send-password-reset-email")]
        public async Task<IActionResult> SendPasswordResetEmail(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null)
                {
                    return NotFound(new CommonResponseMessage<object>
                    {
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                        Message = "User not found"
                    });
                }

                // Generate password reset token
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                
                // TODO: Implement email service to send reset link
                // var resetLink = $"https://yourapp.com/reset-password?token={token}&email={user.Email}";
                // await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);

                return Ok(new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Message = "Password reset email would be sent (not implemented yet)",
                    Data = new { 
                        Token = token,
                        Email = user.Email,
                        Note = "Email service not implemented. Token generated for future use." 
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CommonResponseMessage<object>
                {
                    StatusCode = System.Net.HttpStatusCode.InternalServerError,
                    Message = $"Error sending password reset email: {ex.Message}"
                });
            }
        }

        private string GenerateTemporaryPassword()
        {
            const string chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}