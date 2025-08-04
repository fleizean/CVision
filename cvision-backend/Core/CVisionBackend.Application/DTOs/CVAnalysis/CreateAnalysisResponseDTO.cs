using System;

namespace CVisionBackend.Application.DTOs.CVAnalysis
{
    public class CreateAnalysisResponseDTO
    {
        public Guid AnalysisResultId { get; set; }
        public int Score { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}