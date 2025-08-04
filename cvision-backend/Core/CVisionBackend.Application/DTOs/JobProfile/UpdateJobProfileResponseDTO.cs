using System;
using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.JobProfile
{
    public class UpdateJobProfileResponseDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public List<string> SuggestedKeywords { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}