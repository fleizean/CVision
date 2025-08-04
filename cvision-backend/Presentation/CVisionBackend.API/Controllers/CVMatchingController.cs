using CVisionBackend.Application.Abstractions.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CVMatchingController : ControllerBase
    {
        private readonly ICVAnalysisService _cvAnalysisService;
        private readonly IJobProfileService _jobProfileService;

        public CVMatchingController(ICVAnalysisService cvAnalysisService, IJobProfileService jobProfileService)
        {
            _cvAnalysisService = cvAnalysisService;
            _jobProfileService = jobProfileService;
        }

        [HttpPost("match/{cvId}/with-job/{jobProfileId}")]
        public async Task<IActionResult> MatchCVWithJobProfile(Guid cvId, Guid jobProfileId)
        {
            var cvResult = await _cvAnalysisService.GetAnalysisResultAsync(cvId);
            if (cvResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)cvResult.StatusCode, cvResult);
            }

            var jobProfileResult = await _jobProfileService.GetJobProfileByIdAsync(jobProfileId);
            if (jobProfileResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)jobProfileResult.StatusCode, jobProfileResult);
            }

            var cvKeywords = cvResult.Data.KeywordMatches?.Select(km => km.Keyword).ToList() ?? new List<string>();
            var jobKeywords = jobProfileResult.Data.SuggestedKeywords ?? new List<string>();

            var matchedKeywords = cvKeywords.Intersect(jobKeywords, StringComparer.OrdinalIgnoreCase).ToList();
            var matchPercentage = jobKeywords.Count > 0 ? (matchedKeywords.Count * 100.0) / jobKeywords.Count : 0;

            var response = new
            {
                CVId = cvId,
                JobProfileId = jobProfileId,
                CVTitle = cvResult.Data.CVFileName,
                JobTitle = jobProfileResult.Data.Title,
                MatchPercentage = Math.Round(matchPercentage, 2),
                TotalJobKeywords = jobKeywords.Count,
                MatchedKeywords = matchedKeywords,
                MissingKeywords = jobKeywords.Except(cvKeywords, StringComparer.OrdinalIgnoreCase).ToList(),
                ExtraKeywords = cvKeywords.Except(jobKeywords, StringComparer.OrdinalIgnoreCase).ToList()
            };

            return Ok(new
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Message = "CV-İş profili eşleştirmesi başarıyla tamamlandı.",
                Data = response
            });
        }

        [HttpPost("match/{cvId}/with-all-jobs")]
        public async Task<IActionResult> MatchCVWithAllJobProfiles(Guid cvId)
        {
            var cvResult = await _cvAnalysisService.GetAnalysisResultAsync(cvId);
            if (cvResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)cvResult.StatusCode, cvResult);
            }

            var jobProfilesResult = await _jobProfileService.GetAllJobProfilesAsync();
            if (jobProfilesResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)jobProfilesResult.StatusCode, jobProfilesResult);
            }

            var cvKeywords = cvResult.Data.KeywordMatches?.Select(km => km.Keyword).ToList() ?? new List<string>();
            var matches = new List<object>();

            foreach (var jobProfile in jobProfilesResult.Data)
            {
                var jobKeywords = jobProfile.SuggestedKeywords ?? new List<string>();
                var matchedKeywords = cvKeywords.Intersect(jobKeywords, StringComparer.OrdinalIgnoreCase).ToList();
                var matchPercentage = jobKeywords.Count > 0 ? (matchedKeywords.Count * 100.0) / jobKeywords.Count : 0;

                matches.Add(new
                {
                    JobProfileId = jobProfile.Id,
                    JobTitle = jobProfile.Title,
                    MatchPercentage = Math.Round(matchPercentage, 2),
                    TotalJobKeywords = jobKeywords.Count,
                    MatchedKeywordsCount = matchedKeywords.Count,
                    MatchedKeywords = matchedKeywords,
                    MissingKeywords = jobKeywords.Except(cvKeywords, StringComparer.OrdinalIgnoreCase).ToList()
                });
            }

            var orderedMatches = matches.OrderByDescending(m => (double)m.GetType().GetProperty("MatchPercentage").GetValue(m)).ToList();

            return Ok(new
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Message = "CV tüm iş profilleri ile eşleştirildi.",
                Data = new
                {
                    CVId = cvId,
                    CVTitle = cvResult.Data.CVFileName,
                    TotalJobProfiles = jobProfilesResult.Data.Count,
                    Matches = orderedMatches,
                    BestMatch = orderedMatches.FirstOrDefault(),
                    AverageMatchPercentage = orderedMatches.Count > 0 ? 
                        Math.Round(orderedMatches.Average(m => (double)m.GetType().GetProperty("MatchPercentage").GetValue(m)), 2) : 0
                }
            });
        }

        [HttpGet("top-matches/{jobProfileId}")]
        public async Task<IActionResult> GetTopMatchesForJobProfile(Guid jobProfileId, [FromQuery] int limit = 10)
        {
            var jobProfileResult = await _jobProfileService.GetJobProfileByIdAsync(jobProfileId);
            if (jobProfileResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)jobProfileResult.StatusCode, jobProfileResult);
            }

            var allCVsResult = await _cvAnalysisService.GetAllAnalysisResultsAsync();
            if (allCVsResult.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return StatusCode((int)allCVsResult.StatusCode, allCVsResult);
            }

            var jobKeywords = jobProfileResult.Data.SuggestedKeywords ?? new List<string>();
            var matches = new List<object>();

            foreach (var cv in allCVsResult.Data)
            {
                var cvKeywords = cv.KeywordMatches?.Select(km => km.Keyword).ToList() ?? new List<string>();
                var matchedKeywords = cvKeywords.Intersect(jobKeywords, StringComparer.OrdinalIgnoreCase).ToList();
                var matchPercentage = jobKeywords.Count > 0 ? (matchedKeywords.Count * 100.0) / jobKeywords.Count : 0;

                matches.Add(new
                {
                    CVId = cv.Id,
                    CVFileName = cv.CVFileName,
                    MatchPercentage = Math.Round(matchPercentage, 2),
                    TotalJobKeywords = jobKeywords.Count,
                    MatchedKeywordsCount = matchedKeywords.Count,
                    MatchedKeywords = matchedKeywords,
                    AnalysisDate = cv.AnalysisDate
                });
            }

            var topMatches = matches
                .OrderByDescending(m => (double)m.GetType().GetProperty("MatchPercentage").GetValue(m))
                .Take(limit)
                .ToList();

            return Ok(new
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Message = $"İş profili için en iyi {limit} eşleşme getirildi.",
                Data = new
                {
                    JobProfileId = jobProfileId,
                    JobTitle = jobProfileResult.Data.Title,
                    TotalCVsAnalyzed = allCVsResult.Data.Count,
                    TopMatches = topMatches,
                    AverageMatchPercentage = topMatches.Count > 0 ? 
                        Math.Round(topMatches.Average(m => (double)m.GetType().GetProperty("MatchPercentage").GetValue(m)), 2) : 0
                }
            });
        }
    }
}