using System;
using CVisionBackend.Domain.Entities.Common;
using CVisionBackend.Domain.Entities.Identity;

namespace CVisionBackend.Domain.Entities
{
    public class Activity : BaseEntity
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public ActivityType Type { get; set; }
        public string Description { get; set; }
        public string? Details { get; set; } // JSON string for additional details
        public string? EntityId { get; set; } // ID of related entity (CV file, job profile, etc.)
        public string? EntityType { get; set; } // Type of related entity
        public DateTime Timestamp { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }

        // Navigation property
        public AppUser User { get; set; }
    }

    public enum ActivityType
    {
        UserRegistered = 1,
        UserLogin = 2,
        UserLogout = 3,
        CVFileUploaded = 4,
        CVAnalysisStarted = 5,
        CVAnalysisCompleted = 6,
        CVAnalysisFailed = 7,
        JobProfileCreated = 8,
        JobProfileUpdated = 9,
        JobProfileDeleted = 10,
        CVMatchingPerformed = 11,
        UserStatusChanged = 12,
        FileDeleted = 13,
        SystemMaintenance = 14,
        SecurityAlert = 15
    }
}