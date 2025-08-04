using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Role;
using System;
using System.Threading.Tasks;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _roleService.GetAllRoles();
            return Ok(new { 
                Title = "Get All Roles",
                Message = "Roles retrieved successfully.",
                StatusCode = 200,
                Data = roles 
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDTO createRoleDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _roleService.CreateRoleAsync(createRoleDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRoleToUser([FromBody] AssignRoleDTO assignRoleDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _roleService.AssignRoleToUserAsync(assignRoleDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("remove")]
        public async Task<IActionResult> RemoveRoleFromUser([FromBody] RemoveRoleDTO removeRoleDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _roleService.RemoveRoleFromUserAsync(removeRoleDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserRoles(Guid userId)
        {
            var result = await _roleService.GetUserRolesAsync(userId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUserRoles()
        {
            var result = await _roleService.GetAllUserRolesAsync();
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpDelete("{roleId}")]
        public async Task<IActionResult> DeleteRole(Guid roleId)
        {
            var result = await _roleService.DeleteRoleAsync(roleId);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}