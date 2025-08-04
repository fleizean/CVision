using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CVisionBackend.Domain.Entities.Common;

namespace CVisionBackend.Domain.Entities
{
    public class KeywordMatch : BaseEntity
    {
        public Guid CVAnalysisResultId { get; set; }
        public string Keyword { get; set; }
        public bool IsMatched { get; set; }
        public int Count { get; set; }
        public int MatchCount { get; set; }
        public double Relevance { get; set; }

        public CVAnalysisResult CVAnalysisResult { get; set; }
    }
}