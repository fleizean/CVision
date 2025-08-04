using System;

namespace CVisionBackend.Application.DTOs.CVFile
{
    public class GetCVFileDTO
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string AnalysisStatus { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool HasAnalysis { get; set; }
        public int? AnalysisScore { get; set; }
    }
}