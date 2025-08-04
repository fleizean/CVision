using System;
using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.CVAnalysis
{
    public class GetAnalysisResultDTO
    {
        public Guid Id { get; set; }
        public Guid CVFileId { get; set; }
        public string CVFileName { get; set; }
        public DateTime AnalysisDate { get; set; }
        public int OverallScore { get; set; }
        public string ProcessingStatus { get; set; }
        public List<KeywordMatchDTO> KeywordMatches { get; set; }
    }

    public class KeywordMatchDTO
    {
        public string Keyword { get; set; }
        public int Count { get; set; }
        public double Relevance { get; set; }
    }
}