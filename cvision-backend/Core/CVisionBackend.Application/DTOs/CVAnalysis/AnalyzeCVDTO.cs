using System;
using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.CVAnalysis
{
    public class AnalyzeCVDTO
    {
        public Guid FileId { get; set; }
        public List<string>? TargetKeywords { get; set; }
        public Guid? JobProfileId { get; set; }
    }
}