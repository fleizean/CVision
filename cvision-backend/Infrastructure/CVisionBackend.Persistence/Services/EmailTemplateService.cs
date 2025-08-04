using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CVisionBackend.Application.Abstractions.Services;

namespace CVisionBackend.Persistence.Services
{
    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly IConfiguration _configuration;
        private readonly string _templateBasePath;

        public EmailTemplateService(IConfiguration configuration)
        {
            _configuration = configuration;

            // Go up one directory from the current directory
            string currentDirectory = Directory.GetCurrentDirectory();
            _templateBasePath = Path.Combine(currentDirectory, "Templates", "EmailTemplates");

            // Ensure template directory exists
            if (!Directory.Exists(_templateBasePath))
            {
                Directory.CreateDirectory(_templateBasePath);
            }
        }

        private async Task<string> LoadTemplateAsync(string templatePath)
        {
            if (!File.Exists(templatePath))
            {
                Console.WriteLine($"Template file not found: {templatePath}");
                throw new FileNotFoundException($"Template file not found: {templatePath}");
            }

            return await File.ReadAllTextAsync(templatePath, Encoding.UTF8);
        }

        public async Task<string> SendAnnouncementAsync(string to, string subject, string body, bool isBodyHtml = true)
        {
            try
            {
                var templatePath = Path.Combine(_templateBasePath, "announcement-template.html");
                var template = await LoadTemplateAsync(templatePath);
                string content = template
                .Replace("{{TO}}", to)
                .Replace("{{SUBJECT}}", subject)
                .Replace("{{BODY}}", isBodyHtml ? body : System.Net.WebUtility.HtmlEncode(body));

                return content;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending announcement email: {ex.Message}");
                return GetFallbackAnnouncementTemplate(to, subject, body, isBodyHtml);
            }
        }

        public async Task<string> SendAttendanceNotificationAsync(string to, string studentName, DateTime date, bool isPresent, string parentName)
        {
            try
            {
                var templatePath = Path.Combine(_templateBasePath, "attendance-notification.html");
                var template = await LoadTemplateAsync(templatePath);

                string status = isPresent ? "Okula Katıldı" : "Okula Gelmedi";

                string content = template
                    .Replace("{{PARENTNAME}}", parentName)
                    .Replace("{{STUDENTNAME}}", studentName)
                    .Replace("{{DATE}}", date.ToString("dd MMMM yyyy"))
                    .Replace("{{STATUS}}", status);

                return content;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending attendance email: {ex.Message}");
                return GetFallbackAttendanceTemplate(to, studentName, date, isPresent, parentName);
            }
        }

        public async Task<string> SendPasswordResetMailAsync(string to, Guid userId, string resetToken)
        {
            try
            {
                var templatePath = Path.Combine(_templateBasePath, "forgot_password.html");
                var template = await LoadTemplateAsync(templatePath);

                string appName = _configuration["AppInfo:Name"];
                string title = (!string.IsNullOrWhiteSpace(appName) ? appName : "Çocuksa") + " - Şifre Sıfırlama";

                string resetLink = _configuration["AppInfo:Url"] + $"/reset-password?userId={userId}&token={resetToken}";

                string content = template
                    .Replace("{{RESETLINK}}", resetLink)
                    .Replace("{{APPNAME}}", title);

                return content;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending password reset email: {ex.Message}");
                return GetFallbackResetPasswordTemplate(to);
            }

        }


        #region Fallback Templates
        private string GetFallbackAnnouncementTemplate(string to, string subject, string body, bool isBodyHtml)
        {
            string appName = _configuration["AppInfo:Name"];
            string appDisplayName = !string.IsNullOrWhiteSpace(appName) ? appName : "Çocuksa";
            
            return $@"
                <!DOCTYPE html>
                <html lang=""tr"">
                <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <title>{appDisplayName} - Duyuru</title>
                    <style>
                        body {{
                            margin: 0;
                            padding: 0;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f7fa;
                            color: #333;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 30px 20px;
                            text-align: center;
                            color: white;
                        }}
                        .logo {{
                            width: 80px;
                            height: 80px;
                            background-color: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: bold;
                        }}
                        .content {{
                            padding: 40px 30px;
                        }}
                        .title {{
                            color: #667eea;
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 20px;
                            text-align: center;
                        }}
                        .message-box {{
                            background-color: #f8f9ff;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 0 8px 8px 0;
                        }}
                        .footer {{
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #6c757d;
                            font-size: 14px;
                            border-top: 1px solid #dee2e6;
                        }}
                        .app-name {{
                            color: #667eea;
                            font-weight: bold;
                        }}
                    </style>
                </head>
                <body>
                    <div class=""container"">
                        <div class=""header"">
                            <div class=""logo"">
                                <!-- Logo buraya gelecek -->
                                ÇS
                            </div>
                            <h1 style=""margin: 0; font-size: 28px;"">
                                <span class=""app-name"" style=""color: white;"">
                                    {appDisplayName}
                                </span>
                            </h1>
                        </div>
                        <div class=""content"">
                            <div class=""title"">📢 Duyuru</div>
                            <p>Sayın Veli,</p>
                            <div class=""message-box"">
                                <h3 style=""color: #667eea; margin-top: 0;"">{subject}</h3>
                                <div>{(isBodyHtml ? body : System.Net.WebUtility.HtmlEncode(body))}</div>
                            </div>
                            <p>Bu duyuru tüm velilerimize gönderilmektedir.</p>
                        </div>
                        <div class=""footer"">
                            <p>Bu e-posta <strong class=""app-name"">{appDisplayName}</strong> anaokulu yönetim sistemi tarafından otomatik olarak gönderilmiştir.</p>
                            <p>Herhangi bir sorunuz varsa lütfen okul yönetimi ile iletişime geçin.</p>
                        </div>
                    </div>
                </body>
                </html>";
        }
        
        private string GetFallbackAttendanceTemplate(string to, string studentName, DateTime date, bool isPresent, string parentName)
        {
            string appName = _configuration["AppInfo:Name"];
            string appDisplayName = !string.IsNullOrWhiteSpace(appName) ? appName : "Çocuksa";
            
            string status = isPresent ? "Okula Katıldı" : "Okula Gelmedi";
            string statusColor = isPresent ? "#28a745" : "#dc3545";
            string statusIcon = isPresent ? "✅" : "❌";
            
            return $@"
                <!DOCTYPE html>
                <html lang=""tr"">
                <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <title>{appDisplayName} - Yoklama Bilgilendirmesi</title>
                    <style>
                        body {{
                            margin: 0;
                            padding: 0;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f7fa;
                            color: #333;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 30px 20px;
                            text-align: center;
                            color: white;
                        }}
                        .logo {{
                            width: 80px;
                            height: 80px;
                            background-color: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: bold;
                        }}
                        .content {{
                            padding: 40px 30px;
                        }}
                        .title {{
                            color: #667eea;
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 20px;
                            text-align: center;
                        }}
                        .status-card {{
                            background-color: #f8f9ff;
                            border: 2px solid {statusColor};
                            border-radius: 12px;
                            padding: 25px;
                            margin: 25px 0;
                            text-align: center;
                        }}
                        .status-icon {{
                            font-size: 48px;
                            margin-bottom: 15px;
                        }}
                        .status-text {{
                            font-size: 20px;
                            font-weight: bold;
                            color: {statusColor};
                            margin-bottom: 10px;
                        }}
                        .info-grid {{
                            background-color: #f8f9fa;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }}
                        .info-row {{
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            border-bottom: 1px solid #dee2e6;
                        }}
                        .info-row:last-child {{
                            border-bottom: none;
                        }}
                        .info-label {{
                            font-weight: bold;
                            color: #667eea;
                        }}
                        .footer {{
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #6c757d;
                            font-size: 14px;
                            border-top: 1px solid #dee2e6;
                        }}
                        .app-name {{
                            color: #667eea;
                            font-weight: bold;
                        }}
                    </style>
                </head>
                <body>
                    <div class=""container"">
                        <div class=""header"">
                            <div class=""logo"">
                                <!-- Logo buraya gelecek -->
                                ÇS
                            </div>
                            <h1 style=""margin: 0; font-size: 28px;"">
                                <span class=""app-name"" style=""color: white;"">
                                    {appDisplayName}
                                </span>
                            </h1>
                        </div>
                        <div class=""content"">
                            <div class=""title"">📅 Yoklama Bilgilendirmesi</div>
                            <p>Sayın <strong>{parentName}</strong>,</p>
                            
                            <div class=""info-grid"">
                                <div class=""info-row"">
                                    <span class=""info-label"">👶 Öğrenci:</span>
                                    <span>{studentName}</span>
                                </div>
                                <div class=""info-row"">
                                    <span class=""info-label"">📅 Tarih:</span>
                                    <span>{date:dd MMMM yyyy}</span>
                                </div>
                            </div>
                            
                            <div class=""status-card"">
                                <div class=""status-icon"">{statusIcon}</div>
                                <div class=""status-text"">{status}</div>
                                <p style=""margin: 0; color: #6c757d;"">
                                    {(isPresent ? "Öğrenciniz bugün okula gelmiş ve derslere katılmıştır." : "Öğrenciniz bugün okula gelmemiştir. Herhangi bir sorun varsa lütfen okul yönetimi ile iletişime geçin.")}
                                </p>
                            </div>
                            
                            <p>Bu bilgilendirme size otomatik olarak gönderilmiştir.</p>
                        </div>
                        <div class=""footer"">
                            <p>Bu e-posta <strong class=""app-name"">{appDisplayName}</strong> anaokulu yönetim sistemi tarafından otomatik olarak gönderilmiştir.</p>
                            <p>Herhangi bir sorunuz varsa lütfen okul yönetimi ile iletişime geçin.</p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private string GetFallbackResetPasswordTemplate(string to)
        {
            string appName = _configuration["AppInfo:Name"];
            string appDisplayName = !string.IsNullOrWhiteSpace(appName) ? appName : "Çocuksa";
            
            return $@"
                <!DOCTYPE html>
                <html lang=""tr"">
                <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <title>{appDisplayName} - Şifre Sıfırlama</title>
                    <style>
                        body {{
                            margin: 0;
                            padding: 0;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f7fa;
                            color: #333;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 30px 20px;
                            text-align: center;
                            color: white;
                        }}
                        .logo {{
                            width: 80px;
                            height: 80px;
                            background-color: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: bold;
                        }}
                        .content {{
                            padding: 40px 30px;
                        }}
                        .title {{
                            color: #667eea;
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 20px;
                            text-align: center;
                        }}
                        .alert-box {{
                            background-color: #fff3cd;
                            border: 2px solid #ffc107;
                            border-radius: 12px;
                            padding: 25px;
                            margin: 25px 0;
                            text-align: center;
                        }}
                        .alert-icon {{
                            font-size: 48px;
                            margin-bottom: 15px;
                            color: #ffc107;
                        }}
                        .alert-title {{
                            font-size: 20px;
                            font-weight: bold;
                            color: #856404;
                            margin-bottom: 15px;
                        }}
                        .alert-text {{
                            color: #856404;
                            line-height: 1.6;
                        }}
                        .contact-info {{
                            background-color: #f8f9ff;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                            border-left: 4px solid #667eea;
                        }}
                        .contact-title {{
                            font-weight: bold;
                            color: #667eea;
                            margin-bottom: 10px;
                        }}
                        .footer {{
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #6c757d;
                            font-size: 14px;
                            border-top: 1px solid #dee2e6;
                        }}
                        .app-name {{
                            color: #667eea;
                            font-weight: bold;
                        }}
                        .user-email {{
                            background-color: #e9ecef;
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-family: monospace;
                            color: #495057;
                        }}
                    </style>
                </head>
                <body>
                    <div class=""container"">
                        <div class=""header"">
                            <div class=""logo"">
                                <!-- Logo buraya gelecek -->
                                ÇS
                            </div>
                            <h1 style=""margin: 0; font-size: 28px;"">
                                <span class=""app-name"" style=""color: white;"">
                                    {appDisplayName}
                                </span>
                            </h1>
                        </div>
                        <div class=""content"">
                            <div class=""title"">🔒 Şifre Sıfırlama</div>
                            <p>Sayın kullanıcı,</p>
                            <p>E-posta adresiniz: <span class=""user-email"">{to}</span></p>
                            
                            <div class=""alert-box"">
                                <div class=""alert-icon"">⚠️</div>
                                <div class=""alert-title"">Geçici Hizmet Kesintisi</div>
                                <div class=""alert-text"">
                                    Şifre sıfırlama hizmetimiz şu anda geçici olarak kullanılamamaktadır.
                                    <br><br>
                                    Lütfen birkaç dakika sonra tekrar deneyin veya aşağıdaki iletişim bilgilerinden
                                    sistem yöneticisi ile iletişime geçin.
                                </div>
                            </div>
                            
                            <div class=""contact-info"">
                                <div class=""contact-title"">📞 Yardım İçin İletişim</div>
                                <p>Eğer sorun devam ederse lütfen okul yönetimi ile iletişime geçin:</p>
                                <ul style=""margin: 10px 0; padding-left: 20px;"">
                                    <li>Okul sekreterliği arayarak yardım talep edebilirsiniz</li>
                                    <li>Sistem yöneticisi ile direkt konuşabilirsiniz</li>
                                    <li>Okula giderek şifre sıfırlama işlemi yapabilirsiniz</li>
                                </ul>
                            </div>
                            
                            <p><strong>Not:</strong> Güvenliğiniz için şifre sıfırlama taleplerini sadece güvenilir kaynaklar üzerinden yapın.</p>
                        </div>
                        <div class=""footer"">
                            <p>Bu e-posta <strong class=""app-name"">{appDisplayName}</strong> anaokulu yönetim sistemi tarafından otomatik olarak gönderilmiştir.</p>
                            <p>Herhangi bir sorunuz varsa lütfen okul yönetimi ile iletişime geçin.</p>
                        </div>
                    </div>
                </body>
                </html>";
        }


        #endregion
    }
}