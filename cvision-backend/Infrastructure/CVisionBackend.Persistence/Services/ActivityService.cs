using CVisionBackend.Application.Repositories;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Activity;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class ActivityService : IActivityService
    {
        private readonly IWriteRepository<Activity> _activityWriteRepository;
        private readonly IReadRepository<Activity> _activityReadRepository;

        public ActivityService(IWriteRepository<Activity> activityWriteRepository, IReadRepository<Activity> activityReadRepository)
        {
            _activityWriteRepository = activityWriteRepository;
            _activityReadRepository = activityReadRepository;
        }

        public async Task<CommonResponseMessage<object>> LogActivityAsync(CreateActivityDTO createActivityDTO)
        {
            try
            {
                var activity = new Activity
                {
                    UserId = createActivityDTO.UserId,
                    UserName = createActivityDTO.UserName,
                    UserEmail = createActivityDTO.UserEmail,
                    Type = createActivityDTO.Type,
                    Description = createActivityDTO.Description,
                    Details = createActivityDTO.Details,
                    EntityId = createActivityDTO.EntityId,
                    EntityType = createActivityDTO.EntityType,
                    Timestamp = DateTime.UtcNow,
                    IpAddress = createActivityDTO.IpAddress,
                    UserAgent = createActivityDTO.UserAgent,
                    CreatedAt = DateTime.UtcNow
                };

                await _activityWriteRepository.AddAsync(activity);
                await _activityWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.Created,
                    Message = "Activity logged successfully",
                    Data = new { ActivityId = activity.Id }
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Error logging activity: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetActivityDTO>>> GetRecentActivitiesAsync(int count = 10)
        {
            try
            {
                var activities = await _activityReadRepository.GetAll()
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(count)
                    .Select(a => new GetActivityDTO
                    {
                        Id = a.Id,
                        UserId = a.UserId,
                        UserName = a.UserName,
                        UserEmail = a.UserEmail,
                        Type = a.Type,
                        TypeName = a.Type.ToString(),
                        Description = a.Description,
                        Details = a.Details,
                        EntityId = a.EntityId,
                        EntityType = a.EntityType,
                        Timestamp = a.Timestamp,
                        IpAddress = a.IpAddress,
                        TimeAgo = GetTimeAgo(a.Timestamp)
                    })
                    .ToListAsync();

                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "Recent activities retrieved successfully",
                    Data = activities
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving activities: {ex.Message}",
                    Data = new List<GetActivityDTO>()
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetActivityDTO>>> GetUserActivitiesAsync(Guid userId, int count = 20)
        {
            try
            {
                var activities = await _activityReadRepository.GetAll()
                    .Where(a => !a.IsDeleted && a.UserId == userId)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(count)
                    .Select(a => new GetActivityDTO
                    {
                        Id = a.Id,
                        UserId = a.UserId,
                        UserName = a.UserName,
                        UserEmail = a.UserEmail,
                        Type = a.Type,
                        TypeName = a.Type.ToString(),
                        Description = a.Description,
                        Details = a.Details,
                        EntityId = a.EntityId,
                        EntityType = a.EntityType,
                        Timestamp = a.Timestamp,
                        IpAddress = a.IpAddress,
                        TimeAgo = GetTimeAgo(a.Timestamp)
                    })
                    .ToListAsync();

                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "User activities retrieved successfully",
                    Data = activities
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving user activities: {ex.Message}",
                    Data = new List<GetActivityDTO>()
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetActivityDTO>>> GetActivitiesByTypeAsync(ActivityType type, int count = 20)
        {
            try
            {
                var activities = await _activityReadRepository.GetAll()
                    .Where(a => !a.IsDeleted && a.Type == type)
                    .OrderByDescending(a => a.Timestamp)
                    .Take(count)
                    .Select(a => new GetActivityDTO
                    {
                        Id = a.Id,
                        UserId = a.UserId,
                        UserName = a.UserName,
                        UserEmail = a.UserEmail,
                        Type = a.Type,
                        TypeName = a.Type.ToString(),
                        Description = a.Description,
                        Details = a.Details,
                        EntityId = a.EntityId,
                        EntityType = a.EntityType,
                        Timestamp = a.Timestamp,
                        IpAddress = a.IpAddress,
                        TimeAgo = GetTimeAgo(a.Timestamp)
                    })
                    .ToListAsync();

                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "Activities by type retrieved successfully",
                    Data = activities
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving activities by type: {ex.Message}",
                    Data = new List<GetActivityDTO>()
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetActivityDTO>>> GetActivitiesAsync(int page = 1, int pageSize = 50)
        {
            try
            {
                var skip = (page - 1) * pageSize;
                var activities = await _activityReadRepository.GetAll()
                    .Where(a => !a.IsDeleted)
                    .OrderByDescending(a => a.Timestamp)
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(a => new GetActivityDTO
                    {
                        Id = a.Id,
                        UserId = a.UserId,
                        UserName = a.UserName,
                        UserEmail = a.UserEmail,
                        Type = a.Type,
                        TypeName = a.Type.ToString(),
                        Description = a.Description,
                        Details = a.Details,
                        EntityId = a.EntityId,
                        EntityType = a.EntityType,
                        Timestamp = a.Timestamp,
                        IpAddress = a.IpAddress,
                        TimeAgo = GetTimeAgo(a.Timestamp)
                    })
                    .ToListAsync();

                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "Activities retrieved successfully",
                    Data = activities
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetActivityDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Error retrieving activities: {ex.Message}",
                    Data = new List<GetActivityDTO>()
                };
            }
        }

        public async Task LogUserActivityAsync(Guid userId, string userName, string userEmail, ActivityType type, string description, string? details = null, string? entityId = null, string? entityType = null, string? ipAddress = null, string? userAgent = null)
        {
            try
            {
                var createActivityDTO = new CreateActivityDTO
                {
                    UserId = userId,
                    UserName = userName,
                    UserEmail = userEmail,
                    Type = type,
                    Description = description,
                    Details = details,
                    EntityId = entityId,
                    EntityType = entityType,
                    IpAddress = ipAddress,
                    UserAgent = userAgent
                };

                await LogActivityAsync(createActivityDTO);
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking main functionality
                Console.WriteLine($"Error logging user activity: {ex.Message}");
            }
        }

        private static string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow.Subtract(dateTime);
            
            if (timeSpan.TotalMinutes < 1)
                return "just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minute{(timeSpan.TotalMinutes > 1 ? "s" : "")} ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hour{(timeSpan.TotalHours > 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} day{(timeSpan.TotalDays > 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} week{((int)(timeSpan.TotalDays / 7) > 1 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 365)
                return $"{(int)(timeSpan.TotalDays / 30)} month{((int)(timeSpan.TotalDays / 30) > 1 ? "s" : "")} ago";
            
            return $"{(int)(timeSpan.TotalDays / 365)} year{((int)(timeSpan.TotalDays / 365) > 1 ? "s" : "")} ago";
        }
    }
}