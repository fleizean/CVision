using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Role;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;

        public RoleService(RoleManager<AppRole> roleManager, UserManager<AppUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task<List<GetRole>> GetAllRoles()
        {
            List<GetRole> getRoles = await _roleManager.Roles.Where(p=>p.Name != "Admin")
                .Select(r => new GetRole
                {
                    Id = r.Id,
                    Name = r.Name
                }).ToListAsync();
            return getRoles;
        }

        public async Task<CommonResponseMessage<object>> CreateRoleAsync(CreateRoleDTO createRoleDTO)
        {
            var roleExists = await _roleManager.RoleExistsAsync(createRoleDTO.Name);
            if (roleExists)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Create Role",
                    Message = "Role already exists.",
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            var role = new AppRole
            {
                Name = createRoleDTO.Name
            };

            var result = await _roleManager.CreateAsync(role);
            
            if (!result.Succeeded)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Create Role",
                    Message = "Failed to create role: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            return new CommonResponseMessage<object>
            {
                Title = "Create Role",
                Message = "Role created successfully.",
                StatusCode = HttpStatusCode.Created
            };
        }

        public async Task<CommonResponseMessage<object>> AssignRoleToUserAsync(AssignRoleDTO assignRoleDTO)
        {
            var user = await _userManager.FindByIdAsync(assignRoleDTO.UserId.ToString());
            if (user == null)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Assign Role",
                    Message = "User not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            var role = await _roleManager.FindByIdAsync(assignRoleDTO.RoleId.ToString());
            if (role == null)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Assign Role",
                    Message = "Role not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            var isInRole = await _userManager.IsInRoleAsync(user, role.Name);
            if (isInRole)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Assign Role",
                    Message = "User already has this role.",
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            var result = await _userManager.AddToRoleAsync(user, role.Name);
            
            if (!result.Succeeded)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Assign Role",
                    Message = "Failed to assign role: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            return new CommonResponseMessage<object>
            {
                Title = "Assign Role",
                Message = "Role assigned successfully.",
                StatusCode = HttpStatusCode.OK
            };
        }

        public async Task<CommonResponseMessage<object>> RemoveRoleFromUserAsync(RemoveRoleDTO removeRoleDTO)
        {
            var user = await _userManager.FindByIdAsync(removeRoleDTO.UserId.ToString());
            if (user == null)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Remove Role",
                    Message = "User not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            var role = await _roleManager.FindByIdAsync(removeRoleDTO.RoleId.ToString());
            if (role == null)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Remove Role",
                    Message = "Role not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            var isInRole = await _userManager.IsInRoleAsync(user, role.Name);
            if (!isInRole)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Remove Role",
                    Message = "User does not have this role.",
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            var result = await _userManager.RemoveFromRoleAsync(user, role.Name);
            
            if (!result.Succeeded)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Remove Role",
                    Message = "Failed to remove role: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            return new CommonResponseMessage<object>
            {
                Title = "Remove Role",
                Message = "Role removed successfully.",
                StatusCode = HttpStatusCode.OK
            };
        }

        public async Task<CommonResponseMessage<UserRolesDTO>> GetUserRolesAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return new CommonResponseMessage<UserRolesDTO>
                {
                    Title = "Get User Roles",
                    Message = "User not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleEntities = await _roleManager.Roles
                .Where(r => roles.Contains(r.Name))
                .Select(r => new GetRole { Id = r.Id, Name = r.Name })
                .ToListAsync();

            var userRoles = new UserRolesDTO
            {
                UserId = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Roles = roleEntities
            };

            return new CommonResponseMessage<UserRolesDTO>
            {
                Title = "Get User Roles",
                Message = "User roles retrieved successfully.",
                StatusCode = HttpStatusCode.OK,
                Data = userRoles
            };
        }

        public async Task<CommonResponseMessage<List<UserRolesDTO>>> GetAllUserRolesAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userRolesList = new List<UserRolesDTO>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var roleEntities = await _roleManager.Roles
                    .Where(r => roles.Contains(r.Name))
                    .Select(r => new GetRole { Id = r.Id, Name = r.Name })
                    .ToListAsync();

                userRolesList.Add(new UserRolesDTO
                {
                    UserId = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = roleEntities
                });
            }

            return new CommonResponseMessage<List<UserRolesDTO>>
            {
                Title = "Get All User Roles",
                Message = "All user roles retrieved successfully.",
                StatusCode = HttpStatusCode.OK,
                Data = userRolesList
            };
        }

        public async Task<CommonResponseMessage<object>> DeleteRoleAsync(Guid roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId.ToString());
            if (role == null)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Delete Role",
                    Message = "Role not found.",
                    StatusCode = HttpStatusCode.NotFound
                };
            }

            // Prevent deletion of Admin role
            if (role.Name == "Admin")
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Delete Role",
                    Message = "Admin role cannot be deleted.",
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            var result = await _roleManager.DeleteAsync(role);
            
            if (!result.Succeeded)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Delete Role",
                    Message = "Failed to delete role: " + string.Join(", ", result.Errors.Select(e => e.Description)),
                    StatusCode = HttpStatusCode.BadRequest
                };
            }

            return new CommonResponseMessage<object>
            {
                Title = "Delete Role",
                Message = "Role deleted successfully.",
                StatusCode = HttpStatusCode.OK
            };
        }
    }
}
