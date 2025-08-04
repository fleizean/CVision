using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CVisionBackend.Domain.Entities.Common;
using CVisionBackend.Domain.Entities.Identity;

namespace CVisionBackend.Domain.Entities
{
    public class CVFile : BaseEntity
    {
        public Guid UserId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; } // pdf, docx
        public string ParsedText { get; set; }
        public string AnalysisStatus { get; set; } // Pending, Completed, Failed
        public DateTime UploadedAt { get; set; }

        public AppUser User { get; set; }
        public CVAnalysisResult AnalysisResult { get; set; }

    }
}