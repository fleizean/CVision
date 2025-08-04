using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActivityController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivityController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int count = 10)
        {
            var result = await _activityService.GetRecentActivitiesAsync(count);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserActivities(Guid userId, [FromQuery] int count = 20)
        {
            var result = await _activityService.GetUserActivitiesAsync(userId, count);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("my-activities")]
        public async Task<IActionResult> GetMyActivities([FromQuery] int count = 20)
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? throw new UnauthorizedAccessException());
            var result = await _activityService.GetUserActivitiesAsync(userId, count);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("type/{type}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActivitiesByType(ActivityType type, [FromQuery] int count = 20)
        {
            var result = await _activityService.GetActivitiesByTypeAsync(type, count);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActivities([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await _activityService.GetActivitiesAsync(page, pageSize);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}