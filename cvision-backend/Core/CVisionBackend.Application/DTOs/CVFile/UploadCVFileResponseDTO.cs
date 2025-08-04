using System;

namespace CVisionBackend.Application.DTOs.CVFile
{
    public class UploadCVFileResponseDTO
    {
        public Guid FileId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string AnalysisStatus { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}