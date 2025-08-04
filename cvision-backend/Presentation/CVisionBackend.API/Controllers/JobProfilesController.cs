using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.JobProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JobProfilesController : ControllerBase
    {
        private readonly IJobProfileService _jobProfileService;

        public JobProfilesController(IJobProfileService jobProfileService)
        {
            _jobProfileService = jobProfileService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateJobProfile([FromBody] CreateJobProfileDTO createJobProfileDTO)
        {
            var result = await _jobProfileService.CreateJobProfileAsync(createJobProfileDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("{profileId}")]
        public async Task<IActionResult> GetJobProfileById(Guid profileId)
        {
            var result = await _jobProfileService.GetJobProfileByIdAsync(profileId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobProfiles()
        {
            var result = await _jobProfileService.GetAllJobProfilesAsync();
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("by-title/{title}")]
        public async Task<IActionResult> GetJobProfilesByTitle(string title)
        {
            var result = await _jobProfileService.GetJobProfilesByTitleAsync(title);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentJobProfiles([FromQuery] int count = 10)
        {
            var result = await _jobProfileService.GetRecentJobProfilesAsync(count);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateJobProfile([FromBody] UpdateJobProfileDTO updateJobProfileDTO)
        {
            var result = await _jobProfileService.UpdateJobProfileAsync(updateJobProfileDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpDelete("{profileId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteJobProfile(Guid profileId)
        {
            var result = await _jobProfileService.DeleteJobProfileAsync(profileId);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}