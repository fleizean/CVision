using Azure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.User;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class UserService : IUserService
    {
        readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager, IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<CommonResponseMessage<object>> CreateUserAsync(CreateUserDTO createUserDTO)
        {
            var user = new AppUser
            {
                Email = createUserDTO.Email,
                UserName = createUserDTO.Email,
                Name = createUserDTO.Name,
                Surname = createUserDTO.Surname,
            };

            IdentityResult result = await _userManager.CreateAsync(user, createUserDTO.Password);

            if (!result.Succeeded)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "User creation failed.",
                    Title = "User Registration",
                    StatusCode = HttpStatusCode.BadRequest,
                };
            }

            string roleName = "User"; // default role

            var roleAssignResult = await _userManager.AddToRoleAsync(user, roleName);
            if (!roleAssignResult.Succeeded)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "User creation failed.",
                    Title = "User Registration",
                    StatusCode = HttpStatusCode.BadRequest,
                };
            }

            return new CommonResponseMessage<object>()
            {
                Message = "User created successfully.",
                Title = "User Registration",
                StatusCode = HttpStatusCode.OK,
            };
        }

        public async Task<List<GetUserDTO>> GetByRoleUsers(GetByRoleUserFilter filter)
        {
            var usersInSchool = _userManager.Users
                .ToList();

            var filteredUsers = new List<GetUserDTO>();

            foreach (var user in usersInSchool)
            {
                var roles = await _userManager.GetRolesAsync(user);

                // Kullanıcının rolleri, filtredeki rollerden herhangi biri ile eşleşiyor mu?
                if (roles.Any(r => filter.RoleName.Any(f => f.Equals(r, StringComparison.OrdinalIgnoreCase))))
                {
                    filteredUsers.Add(new GetUserDTO
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Surname = user.Surname,
                        Email = user.Email,
                        Roles = roles.ToList(),
                        RoleName = roles.FirstOrDefault() // Backward compatibility
                    });
                }
            }

            return filteredUsers;
        }
        public async Task<CommonListObject<GetListUser>> GetListUsers(PageSizeDTO pageSizeDTO)
        {
            var userContext = _httpContextAccessor.HttpContext.User;

            // Identity null kontrolü
            if (userContext?.Identity?.Name == null)
            {
                return new CommonListObject<GetListUser>
                {
                    Lists = new List<GetListUser>(),
                    TotalCount = 0
                };
            }

            var roleContext = userContext.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            //var userId = userContext.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var requester = await _userManager.FindByNameAsync(userContext.Identity.Name);

            // Alternatif olarak:
            // var roleAlt = user.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
            if (requester == null)
            {
                return new CommonListObject<GetListUser>
                {
                    Lists = new List<GetListUser>(),
                    TotalCount = 0
                };
            }

            var requesterRoles = await _userManager.GetRolesAsync(requester);
            var isAdmin = requesterRoles.Contains("Admin");


            var query = _userManager.Users;

            var totalCount = await query.CountAsync();

            var allUsers = await query
                .Skip(pageSizeDTO.Page * pageSizeDTO.Size)
                .Take(pageSizeDTO.Size)
                .ToListAsync();

            var users = new List<GetListUser>();

            foreach (var user in allUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                string? roleName = roles.FirstOrDefault();
                Guid roleId = Guid.Empty;

                if (!string.IsNullOrEmpty(roleName))
                {
                    var role = await _roleManager.FindByNameAsync(roleName);
                    if (role != null)
                        roleId = role.Id;
                }

                users.Add(new GetListUser
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Surname = user.Surname,
                    RoleName = roleName,
                    RoleId = roleId
                });
            }

            return new CommonListObject<GetListUser>()
            {
                Lists = users,
                TotalCount = totalCount
            };
        }

        public async Task<CommonResponseMessage<object>> UpdateUserAsync(UpdateUserDTO updateUserDTO)
        {
            // Güvenlik kontrolü - sadece kendi okulundaki kullanıcıları güncelleyebilir
            var userContext = _httpContextAccessor.HttpContext.User;

            // Identity null kontrolü
            if (userContext?.Identity?.Name == null)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "Yetkilendirme hatası - Kullanıcı kimliği bulunamadı",
                    Title = "Kullanıcı Güncelleme",
                    StatusCode = HttpStatusCode.Unauthorized,
                };
            }

            var requester = await _userManager.FindByNameAsync(userContext.Identity.Name);
            if (requester == null)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "Yetkilendirme hatası",
                    Title = "Kullanıcı Güncelleme",
                    StatusCode = HttpStatusCode.Unauthorized,
                };
            }

            var requesterRoles = await _userManager.GetRolesAsync(requester);
            var isAdmin = requesterRoles.Contains("Admin");

            var user = await _userManager.FindByIdAsync(updateUserDTO.Id.ToString());
            if (user == null)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "Kullanıcı bulunamadı",
                    Title = "Kullanıcı Güncelleme",
                    StatusCode = HttpStatusCode.NotFound,
                };
            }

            // Temel bilgileri güncelle
            user.Name = updateUserDTO.Name;
            user.Surname = updateUserDTO.Surname;
            user.Email = updateUserDTO.Email;

            // Admin ise şifre ve okul bilgilerini de güncelle
            if (isAdmin)
            {
                if (!string.IsNullOrEmpty(updateUserDTO.Password))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var passwordResult = await _userManager.ResetPasswordAsync(user, token, updateUserDTO.Password);
                    if (!passwordResult.Succeeded)
                    {
                        var response = new CommonResponseMessage<object>();
                        foreach (var error in passwordResult.Errors)
                        {
                            response.Message += $"{error.Code} : {error.Description}\n";
                        }
                        response.StatusCode = HttpStatusCode.BadRequest;
                        response.Title = "Şifre Güncelleme";
                        return response;
                    }
                }
            }

            // Rol güncelleme
            var currentRoles = await _userManager.GetRolesAsync(user);
            var currentRoleName = currentRoles.FirstOrDefault();

            var newRole = await _roleManager.FindByIdAsync(updateUserDTO.RoleId.ToString());
            if (newRole == null)
            {
                return new CommonResponseMessage<object>()
                {
                    Message = "Yeni rol bulunamadı",
                    Title = "Kullanıcı Güncelleme",
                    StatusCode = HttpStatusCode.NotFound,
                };
            }

            // Eğer yeni rol farklıysa, önce eski rolü çıkar, sonra yeni rolü ekle
            if (currentRoleName != newRole.Name)
            {
                if (!string.IsNullOrEmpty(currentRoleName))
                {
                    var removeResult = await _userManager.RemoveFromRoleAsync(user, currentRoleName);
                    if (!removeResult.Succeeded)
                    {
                        var response = new CommonResponseMessage<object>();
                        foreach (var error in removeResult.Errors)
                        {
                            response.Message += $"{error.Code} : {error.Description}\n";
                        }
                        response.StatusCode = HttpStatusCode.BadRequest;
                        response.Title = "Rol Güncelleme";
                        return response;
                    }
                }

                var addResult = await _userManager.AddToRoleAsync(user, newRole.NormalizedName);
                if (!addResult.Succeeded)
                {
                    var response = new CommonResponseMessage<object>();
                    foreach (var error in addResult.Errors)
                    {
                        response.Message += $"{error.Code} : {error.Description}\n";
                    }
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.Title = "Rol Güncelleme";
                    return response;
                }
            }

            // Kullanıcı bilgilerini güncelle
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var response = new CommonResponseMessage<object>();
                foreach (var error in updateResult.Errors)
                {
                    response.Message += $"{error.Code} : {error.Description}\n";
                }
                response.StatusCode = HttpStatusCode.BadRequest;
                response.Title = "Kullanıcı Güncelleme";
                return response;
            }

            return new CommonResponseMessage<object>()
            {
                Message = "Kullanıcı başarıyla güncellendi",
                Title = "Kullanıcı Güncelleme",
                StatusCode = HttpStatusCode.OK,
            };
        }

        public async Task<GetUserDTO> GetByIdUser(Guid id)
        {
            // Güvenlik kontrolü
            var userContext = _httpContextAccessor.HttpContext.User;

            // Identity null kontrolü
            if (userContext?.Identity?.Name == null)
            {
                return null;
            }

            var requester = await _userManager.FindByNameAsync(userContext.Identity.Name);
            if (requester == null)
            {
                return null;
            }

            var requesterRoles = await _userManager.GetRolesAsync(requester);
            var isAdmin = requesterRoles.Contains("Admin");

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleName = roles.FirstOrDefault();
            Guid roleId = Guid.Empty;

            if (!string.IsNullOrEmpty(roleName))
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role != null)
                    roleId = role.Id;
            }

            return new GetUserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                Roles = new List<string> { roleName },
                RoleName = roleName,
                RoleId = roleId,
            };
        }

    }
}
