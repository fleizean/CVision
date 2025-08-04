using System.Collections.Generic;

namespace CVisionBackend.Application.DTOs.JobProfile
{
    public class CreateJobProfileDTO
    {
        public string Title { get; set; }
        public List<string> SuggestedKeywords { get; set; }
    }
}