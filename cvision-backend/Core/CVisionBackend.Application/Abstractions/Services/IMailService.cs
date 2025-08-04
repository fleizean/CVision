using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IMailService
    {
        Task SendMailAsync(string body, string subject, string to, bool isBodyHtml = true);
        Task MultipleSendMailAsync(string body, string subject, string[] tos, bool isBodyHtml = true);
    }
}