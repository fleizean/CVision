using System;
using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.JobProfile
{
    public class GetJobProfileDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public List<string> SuggestedKeywords { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}