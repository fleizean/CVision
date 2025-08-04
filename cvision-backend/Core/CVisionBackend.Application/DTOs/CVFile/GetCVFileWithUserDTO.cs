using System;

namespace CVisionBackend.Application.DTOs.CVFile
{
    public class GetCVFileWithUserDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string AnalysisStatus { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool HasAnalysis { get; set; }
        public int? AnalysisScore { get; set; }
        
        // User Information
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string UserFullName { get; set; }
    }
}