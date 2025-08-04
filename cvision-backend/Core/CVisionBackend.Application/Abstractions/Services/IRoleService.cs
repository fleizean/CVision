using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.Role;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IRoleService
    {
        Task<List<GetRole>> GetAllRoles();
        Task<CommonResponseMessage<object>> CreateRoleAsync(CreateRoleDTO createRoleDTO);
        Task<CommonResponseMessage<object>> AssignRoleToUserAsync(AssignRoleDTO assignRoleDTO);
        Task<CommonResponseMessage<object>> RemoveRoleFromUserAsync(RemoveRoleDTO removeRoleDTO);
        Task<CommonResponseMessage<UserRolesDTO>> GetUserRolesAsync(Guid userId);
        Task<CommonResponseMessage<List<UserRolesDTO>>> GetAllUserRolesAsync();
        Task<CommonResponseMessage<object>> DeleteRoleAsync(Guid roleId);
    }
}
