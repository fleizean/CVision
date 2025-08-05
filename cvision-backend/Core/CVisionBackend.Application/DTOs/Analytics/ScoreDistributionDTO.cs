namespace CVisionBackend.Application.DTOs.Analytics
{
    public class ScoreDistributionDTO
    {
        public int Excellent { get; set; } // 90-100
        public int Good { get; set; }      // 75-89
        public int Average { get; set; }   // 60-74
        public int Poor { get; set; }      // 0-59
    }
}