using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Analytics;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.Repositories.CVAnalysisResult;
using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Application.Repositories.KeywordMatch;
using CVisionBackend.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly CVisionDbContext _context;
        private readonly ICVAnalysisResultReadRepository _analysisResultReadRepository;
        private readonly ICVFileReadRepository _cvFileReadRepository;
        private readonly IKeywordMatchReadRepository _keywordMatchReadRepository;

        public AnalyticsService(
            CVisionDbContext context,
            ICVAnalysisResultReadRepository analysisResultReadRepository,
            ICVFileReadRepository cvFileReadRepository,
            IKeywordMatchReadRepository keywordMatchReadRepository)
        {
            _context = context;
            _analysisResultReadRepository = analysisResultReadRepository;
            _cvFileReadRepository = cvFileReadRepository;
            _keywordMatchReadRepository = keywordMatchReadRepository;
        }

        public async Task<CommonResponseMessage<AnalyticsDataDTO>> GetAnalyticsDataAsync(string timeRange = "30days")
        {
            try
            {
                var days = GetDaysFromTimeRange(timeRange);
                var startDate = DateTime.UtcNow.AddDays(-days);

                var analyticsData = new AnalyticsDataDTO
                {
                    Overview = await GetOverviewDataAsync(startDate),
                    AnalysisStats = await GetAnalysisStatsAsync(startDate),
                    UserActivity = await GetUserActivityAsync(startDate),
                    ScoreDistribution = await GetScoreDistributionAsync(startDate),
                    MonthlyData = await GetMonthlyDataAsync(),
                    TopKeywords = await GetTopKeywordsAsync(startDate)
                };

                return new CommonResponseMessage<AnalyticsDataDTO>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "Analytics data başarıyla getirildi.",
                    Data = analyticsData
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<AnalyticsDataDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Analytics data getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        private async Task<AnalyticsOverviewDTO> GetOverviewDataAsync(DateTime startDate)
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalCVFiles = await _cvFileReadRepository.GetAll().CountAsync();
            var totalAnalyses = await _analysisResultReadRepository.GetAll().CountAsync();
            
            var avgScore = await _analysisResultReadRepository.GetAll()
                .Where(ar => ar.Score > 0)
                .AverageAsync(ar => (double?)ar.Score) ?? 0;

            // Mock growth rates since AppUser doesn't have CreatedAt
            var userGrowthRate = 12.5; // Mock data
            var fileUploadRate = 8.3;  // Mock data

            var currentPeriodFiles = await _cvFileReadRepository.GetAll()
                .Where(f => f.UploadedAt >= startDate)
                .CountAsync();

            return new AnalyticsOverviewDTO
            {
                TotalUsers = totalUsers,
                TotalCVFiles = totalCVFiles,
                TotalAnalyses = totalAnalyses,
                AvgAnalysisScore = Math.Round(avgScore, 1),
                UserGrowthRate = Math.Round(userGrowthRate, 1),
                FileUploadRate = Math.Round(fileUploadRate, 1)
            };
        }

        private async Task<AnalysisStatsDTO> GetAnalysisStatsAsync(DateTime startDate)
        {
            var cvFiles = await _cvFileReadRepository.GetAll()
                .Where(f => f.UploadedAt >= startDate)
                .ToListAsync();

            var completed = cvFiles.Count(f => f.AnalysisStatus == "Completed");
            var pending = cvFiles.Count(f => f.AnalysisStatus == "Pending");
            var failed = cvFiles.Count(f => f.AnalysisStatus == "Failed");

            return new AnalysisStatsDTO
            {
                Completed = completed,
                Pending = pending,
                Failed = failed,
                AvgProcessingTime = 145 // Mock data - gerçek processing time hesaplanabilir
            };
        }

        private async Task<UserActivityDTO> GetUserActivityAsync(DateTime startDate)
        {
            var totalUsers = await _context.Users.CountAsync();
            
            // Mock data since AppUser doesn't have CreatedAt/UpdatedAt
            var activeUsers = (int)(totalUsers * 0.7); // 70% of users are active
            var newUsersThisMonth = (int)(totalUsers * 0.1); // 10% are new this month
            var returningUsers = activeUsers - newUsersThisMonth;

            return new UserActivityDTO
            {
                ActiveUsers = activeUsers,
                NewUsersThisMonth = newUsersThisMonth,
                ReturningUsers = Math.Max(0, returningUsers)
            };
        }

        private async Task<ScoreDistributionDTO> GetScoreDistributionAsync(DateTime startDate)
        {
            var scores = await _analysisResultReadRepository.GetAll()
                .Include(ar => ar.CVFile)
                .Where(ar => ar.CVFile!.UploadedAt >= startDate && ar.Score > 0)
                .Select(ar => ar.Score)
                .ToListAsync();

            var totalScores = scores.Count;
            if (totalScores == 0)
            {
                return new ScoreDistributionDTO();
            }

            var excellent = scores.Count(s => s >= 90);
            var good = scores.Count(s => s >= 75 && s < 90);
            var average = scores.Count(s => s >= 60 && s < 75);
            var poor = scores.Count(s => s < 60);

            return new ScoreDistributionDTO
            {
                Excellent = (int)Math.Round((double)excellent / totalScores * 100),
                Good = (int)Math.Round((double)good / totalScores * 100),
                Average = (int)Math.Round((double)average / totalScores * 100),
                Poor = (int)Math.Round((double)poor / totalScores * 100)
            };
        }

        private async Task<List<MonthlyDataDTO>> GetMonthlyDataAsync()
        {
            var monthlyData = new List<MonthlyDataDTO>();
            var currentDate = DateTime.UtcNow;

            for (int i = 4; i >= 0; i--)
            {
                var monthStart = new DateTime(currentDate.Year, currentDate.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1);

                var uploads = await _cvFileReadRepository.GetAll()
                    .Where(f => f.UploadedAt >= monthStart && f.UploadedAt < monthEnd)
                    .CountAsync();

                var analyses = await _analysisResultReadRepository.GetAll()
                    .Include(ar => ar.CVFile)
                    .Where(ar => ar.CVFile!.UploadedAt >= monthStart && ar.CVFile.UploadedAt < monthEnd)
                    .CountAsync();

                // Mock user data for monthly growth
                var baseUsers = 800 + (i * 50); // Simulated growth
                var users = baseUsers + (uploads / 2); // Some correlation with uploads

                monthlyData.Add(new MonthlyDataDTO
                {
                    Month = monthStart.ToString("MMM"),
                    Users = users,
                    Uploads = uploads,
                    Analyses = analyses
                });
            }

            return monthlyData;
        }

        private async Task<List<TopKeywordDTO>> GetTopKeywordsAsync(DateTime startDate)
        {
            var topKeywords = await _keywordMatchReadRepository.GetAll()
                .Include(km => km.CVAnalysisResult)
                .ThenInclude(ar => ar!.CVFile)
                .Where(km => km.CVAnalysisResult!.CVFile!.UploadedAt >= startDate)
                .GroupBy(km => km.Keyword)
                .Select(g => new TopKeywordDTO
                {
                    Keyword = g.Key,
                    Count = g.Sum(km => km.Count)
                })
                .OrderByDescending(k => k.Count)
                .Take(8)
                .ToListAsync();

            return topKeywords;
        }

        private int GetDaysFromTimeRange(string timeRange)
        {
            return timeRange switch
            {
                "7days" => 7,
                "30days" => 30,
                "90days" => 90,
                "1year" => 365,
                _ => 30
            };
        }
    }
}