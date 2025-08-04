using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CVisionBackend.Domain.Entities.Common;

namespace CVisionBackend.Domain.Entities
{
    public class CVAnalysisResult : BaseEntity
    {
        public Guid CVFileId { get; set; }
        public int Score { get; set; }
        [NotMapped]
        public List<string> MissingSections
        {
            get => string.IsNullOrEmpty(MissingSectionsJson) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(MissingSectionsJson);
            set => MissingSectionsJson = JsonSerializer.Serialize(value);
        }
        public string MissingSectionsJson { get; set; }
        
        [NotMapped]
        public List<string> FormatIssues
        {
            get => string.IsNullOrEmpty(FormatIssuesJson) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(FormatIssuesJson);
            set => FormatIssuesJson = JsonSerializer.Serialize(value);
        }
        public string FormatIssuesJson { get; set; }

        public CVFile CVFile { get; set; }
        public ICollection<KeywordMatch> KeywordMatches { get; set; }

    }
}