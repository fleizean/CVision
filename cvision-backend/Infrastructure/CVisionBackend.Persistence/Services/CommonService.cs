using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.User;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class CommonService : ICommonService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<AppUser> _userManager;
        
        public CommonService(IHttpContextAccessor httpContextAccessor, UserManager<AppUser> userManager)
        {
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
        }
        public Guid GetSchoolIdFromUser()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user == null)
                throw new Exception("Kullanıcı bilgisi alınamadı.");

            var schoolIdClaim = user.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid");
            if (schoolIdClaim == null || string.IsNullOrEmpty(schoolIdClaim.Value))
                throw new Exception("Kullanıcıya ait okul bilgisi bulunamadı.");

            return Guid.Parse(schoolIdClaim.Value);
        }

        public string GetUserRoleFromUser()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user == null)
                throw new Exception("Kullanıcı bilgisi alınamadı.");

            var roleClaim = user.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
            if (roleClaim == null || string.IsNullOrEmpty(roleClaim.Value))
                return "Admin"; // Varsayılan olarak Admin

            return roleClaim.Value;
        }

        public string GetUserIdFromUser()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user == null)
                throw new Exception("Kullanıcı bilgisi alınamadı.");

            var userName = user.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
                throw new Exception("Kullanıcı adı bulunamadı.");

            var appUser = _userManager.FindByNameAsync(userName).Result;
            if (appUser == null)
                throw new Exception("Kullanıcı bulunamadı.");

            Console.WriteLine($"Found User ID: {appUser.Id}");
            return appUser.Id.ToString();
        }
    }
}