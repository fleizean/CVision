using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.CVFile;
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
    public class CVFilesController : ControllerBase
    {
        private readonly ICVFileService _cvFileService;

        public CVFilesController(ICVFileService cvFileService)
        {
            _cvFileService = cvFileService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        [ProducesResponseType(typeof(object), 401)]
        public async Task<IActionResult> UploadCVFile(IFormFile file, string? description)
        {
            // Validate the file
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { 
                    Title = "File Upload",
                    Message = "No file was uploaded.",
                    StatusCode = 400
                });
            }

            var uploadCVFileDTO = new UploadCVFileDTO
            {
                File = file,
                Description = description
            };

            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? throw new UnauthorizedAccessException());
            var result = await _cvFileService.UploadCVFileAsync(uploadCVFileDTO, userId);
            
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("my-files")]
        public async Task<IActionResult> GetMyFiles()
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? throw new UnauthorizedAccessException());
            var result = await _cvFileService.GetUserFilesAsync(userId);
            
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("{fileId}")]
        public async Task<IActionResult> GetFileById(Guid fileId)
        {
            var result = await _cvFileService.GetFileByIdAsync(fileId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("{fileId}/with-analysis")]
        public async Task<IActionResult> GetFileWithAnalysis(Guid fileId)
        {
            var result = await _cvFileService.GetFileWithAnalysisAsync(fileId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? throw new UnauthorizedAccessException());
            var result = await _cvFileService.DeleteFileAsync(fileId, userId);
            
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("by-status/{status}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetFilesByStatus(string status)
        {
            var result = await _cvFileService.GetFilesByStatusAsync(status);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPut("{fileId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateFileStatus(Guid fileId, [FromBody] string status)
        {
            var result = await _cvFileService.UpdateFileStatusAsync(fileId, status);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("admin/all-files-with-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllFilesWithUserInfo()
        {
            var result = await _cvFileService.GetAllFilesWithUserInfoAsync();
            return StatusCode((int)result.StatusCode, result);
        }
    }
}