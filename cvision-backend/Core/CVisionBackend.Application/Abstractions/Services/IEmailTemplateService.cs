using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IEmailTemplateService
    {
        Task<string> SendPasswordResetMailAsync(string to, Guid userId, string resetToken);
        Task<string> SendAttendanceNotificationAsync(string to, string studentName, DateTime date, bool isPresent, string parentName);
        Task<string> SendAnnouncementAsync(string to, string subject, string body, bool isBodyHtml = true);
    }
}