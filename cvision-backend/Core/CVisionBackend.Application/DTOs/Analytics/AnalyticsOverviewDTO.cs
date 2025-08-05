namespace CVisionBackend.Application.DTOs.Analytics
{
    public class AnalyticsOverviewDTO
    {
        public int TotalUsers { get; set; }
        public int TotalCVFiles { get; set; }
        public int TotalAnalyses { get; set; }
        public double AvgAnalysisScore { get; set; }
        public double UserGrowthRate { get; set; }
        public double FileUploadRate { get; set; }
    }
}