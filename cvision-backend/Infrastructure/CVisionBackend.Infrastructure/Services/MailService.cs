using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CVisionBackend.Application.Abstractions.Services;

namespace CVisionBackend.Infrastructure.Services
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _configuration;

        public MailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private SmtpClient? CreateSmtpClient(out string? from)
        {
            from = _configuration["MailSettings:Mail"] ?? _configuration["SmtpSettings:UserName"];
            var password = _configuration["MailSettings:Password"] ?? _configuration["SmtpSettings:Password"];
            var smtpHost = _configuration["MailSettings:SmtpHost"] ?? _configuration["SmtpSettings:Host"];
            var smtpPortStr = _configuration["MailSettings:SmtpPort"] ?? _configuration["SmtpSettings:Port"];

            if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpPortStr) ||
                !int.TryParse(smtpPortStr, out int smtpPort))
            {
                from = null;
                return null;
            }

            return new SmtpClient(smtpHost)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(from, password),
                EnableSsl = true,
            };
        }
        public Task SendMailAsync(string body, string subject, string to, bool isBodyHtml = true)
        {
            var smtpClient = CreateSmtpClient(out var from);
            if (smtpClient == null || string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException("SMTP ayarları eksik veya hatalı.");

            var mailMessage = new MailMessage
            {
                From = new MailAddress(from, _configuration["AppInfo:Name"] ?? "Çocuksa"),
                Subject = subject,
                Body = body,
                IsBodyHtml = isBodyHtml,
            };

            mailMessage.To.Add(to);

            return smtpClient.SendMailAsync(mailMessage);
        }
        public Task MultipleSendMailAsync(string body, string subject, string[] tos, bool isBodyHtml = true)
        {
            var smtpClient = CreateSmtpClient(out var from);
            if (smtpClient == null || string.IsNullOrWhiteSpace(from))
                throw new InvalidOperationException("SMTP ayarları eksik veya hatalı.");

            var mailMessage = new MailMessage
            {
                From = new MailAddress(from, ""),
                Subject = subject,
                Body = body,
                IsBodyHtml = isBodyHtml,
            };

            foreach (var to in tos.Where(t => !string.IsNullOrWhiteSpace(t)))
            {
                mailMessage.To.Add(to);
            }

            if (mailMessage.To.Count == 0)
                throw new InvalidOperationException("Geçerli alıcı adresi bulunamadı.");

            return smtpClient.SendMailAsync(mailMessage);
        }
    }
}