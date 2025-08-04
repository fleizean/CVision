using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IUserService
    {
        Task<CommonResponseMessage<object>> CreateUserAsync(CreateUserDTO createUserDTO);
        Task<CommonResponseMessage<object>> UpdateUserAsync(UpdateUserDTO updateUserDTO);
        Task<CommonListObject<GetListUser>> GetListUsers(PageSizeDTO pageSizeDTO);
        Task<List<GetUserDTO>> GetByRoleUsers(GetByRoleUserFilter getByRoleUserFilter);
        Task<GetUserDTO> GetByIdUser(Guid id);
    }
}
