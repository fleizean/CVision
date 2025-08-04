using CVisionBackend.Domain.Entities;
using System;

namespace CVisionBackend.Application.DTOs.Activity
{
    public class CreateActivityDTO
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public ActivityType Type { get; set; }
        public string Description { get; set; }
        public string? Details { get; set; }
        public string? EntityId { get; set; }
        public string? EntityType { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}