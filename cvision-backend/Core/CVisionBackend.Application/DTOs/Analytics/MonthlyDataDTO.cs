namespace CVisionBackend.Application.DTOs.Analytics
{
    public class MonthlyDataDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Users { get; set; }
        public int Uploads { get; set; }
        public int Analyses { get; set; }
    }
}