using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CVisionBackend.Domain.Entities.Common;

namespace CVisionBackend.Domain.Entities
{
    public class JobProfile : BaseEntity
    {
        public string Title { get; set; }
        [NotMapped]
        public List<string> SuggestedKeywords
        {
            get => string.IsNullOrEmpty(SuggestedKeywordsJson) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(SuggestedKeywordsJson);
            set => SuggestedKeywordsJson = JsonSerializer.Serialize(value);
        }
        public string SuggestedKeywordsJson { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}