using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.CVAnalysis;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "admin")]
    public class CVAnalysisController : ControllerBase
    {
        private readonly ICVAnalysisService _cvAnalysisService;

        public CVAnalysisController(ICVAnalysisService cvAnalysisService)
        {
            _cvAnalysisService = cvAnalysisService;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeCV([FromBody] AnalyzeCVDTO analyzeCVDTO)
        {
            var result = await _cvAnalysisService.AnalyzeCVAsync(analyzeCVDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("result/{fileId}")]
        public async Task<IActionResult> GetAnalysisResult(Guid fileId)
        {
            var result = await _cvAnalysisService.GetAnalysisResultAsync(fileId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("results/by-score")]
        public async Task<IActionResult> GetAnalysisResultsByScoreRange([FromQuery] int minScore, [FromQuery] int maxScore)
        {
            var result = await _cvAnalysisService.GetAnalysisResultsByScoreRangeAsync(minScore, maxScore);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("results")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAnalysisResults()
        {
            var result = await _cvAnalysisService.GetAllAnalysisResultsAsync();
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpDelete("result/{analysisResultId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnalysisResult(Guid analysisResultId)
        {
            var result = await _cvAnalysisService.DeleteAnalysisResultAsync(analysisResultId);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}