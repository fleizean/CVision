namespace CVisionBackend.Application.DTOs.Analytics
{
    public class AnalysisStatsDTO
    {
        public int Completed { get; set; }
        public int Pending { get; set; }
        public int Failed { get; set; }
        public int AvgProcessingTime { get; set; }
    }
}