using CVisionBackend.Application.DTOs.Activity;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IActivityService
    {
        Task<CommonResponseMessage<object>> LogActivityAsync(CreateActivityDTO createActivityDTO);
        Task<CommonResponseMessage<List<GetActivityDTO>>> GetRecentActivitiesAsync(int count = 10);
        Task<CommonResponseMessage<List<GetActivityDTO>>> GetUserActivitiesAsync(Guid userId, int count = 20);
        Task<CommonResponseMessage<List<GetActivityDTO>>> GetActivitiesByTypeAsync(ActivityType type, int count = 20);
        Task<CommonResponseMessage<List<GetActivityDTO>>> GetActivitiesAsync(int page = 1, int pageSize = 50);
        Task LogUserActivityAsync(Guid userId, string userName, string userEmail, ActivityType type, string description, string? details = null, string? entityId = null, string? entityType = null, string? ipAddress = null, string? userAgent = null);
    }
}