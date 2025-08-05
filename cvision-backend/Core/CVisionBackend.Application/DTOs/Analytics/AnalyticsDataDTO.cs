using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.Analytics
{
    public class AnalyticsDataDTO
    {
        public AnalyticsOverviewDTO Overview { get; set; } = new();
        public AnalysisStatsDTO AnalysisStats { get; set; } = new();
        public UserActivityDTO UserActivity { get; set; } = new();
        public ScoreDistributionDTO ScoreDistribution { get; set; } = new();
        public List<MonthlyDataDTO> MonthlyData { get; set; } = new();
        public List<TopKeywordDTO> TopKeywords { get; set; } = new();
    }
}