using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.Repositories;
using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Application.Repositories.CVAnalysisResult;
using CVisionBackend.Application.Repositories.KeywordMatch;
using CVisionBackend.Application.Repositories.JobProfile;
using CVisionBackend.Application.Repositories.RefreshToken;
using CVisionBackend.Domain.Entities.Identity;
using CVisionBackend.Persistence.Contexts;
using CVisionBackend.Persistence.Services;
using CVisionBackend.Persistence.Repositories;
using CVisionBackend.Persistence.Repositories.CVFile;
using CVisionBackend.Persistence.Repositories.CVAnalysisResult;
using CVisionBackend.Persistence.Repositories.KeywordMatch;
using CVisionBackend.Persistence.Repositories.JobProfile;
using CVisionBackend.Persistence.Repositories.RefreshToken;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TimeZoneConverter;

namespace CVisionBackend.Persistence
{
    public static class ServiceRegistration
    {
        public static void AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddIdentity<AppUser, AppRole>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
    }).AddEntityFrameworkStores<CVisionDbContext>()
      .AddDefaultTokenProviders();

    services.AddDbContext<CVisionDbContext>(options => options.UseSqlServer(Configuration.ConnectionString));

    // Configure authentication with proper scheme handling
    services.AddAuthentication(options => 
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => // This adds the default "Bearer" scheme
    {
        options.TokenValidationParameters = new()
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,

            ValidIssuer = configuration["Token:Issuer"],
            ValidAudience = configuration["Token:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Token:SecurityKey"])),

            // LifetimeValidator removed - using default validation
            NameClaimType = ClaimTypes.Name
        };
    })
    .AddJwtBearer("admin", options => // Keep your admin scheme for specific endpoints
    {
        options.TokenValidationParameters = new()
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,

            ValidIssuer = configuration["Token:Issuer"],
            ValidAudience = configuration["Token:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Token:SecurityKey"])),

            // LifetimeValidator removed - using default validation
            NameClaimType = ClaimTypes.Name
        };
    });


            // Repository registrations
            services.AddScoped<IReadRepository<Domain.Entities.CVFile>, ReadRepository<Domain.Entities.CVFile>>();
            services.AddScoped<IWriteRepository<Domain.Entities.CVFile>, WriteRepository<Domain.Entities.CVFile>>();
            services.AddScoped<ICVFileReadRepository, CVFileReadRepository>();
            services.AddScoped<ICVFileWriteRepository, CVFileWriteRepository>();

            services.AddScoped<IReadRepository<Domain.Entities.CVAnalysisResult>, ReadRepository<Domain.Entities.CVAnalysisResult>>();
            services.AddScoped<IWriteRepository<Domain.Entities.CVAnalysisResult>, WriteRepository<Domain.Entities.CVAnalysisResult>>();
            services.AddScoped<ICVAnalysisResultReadRepository, CVAnalysisResultReadRepository>();
            services.AddScoped<ICVAnalysisResultWriteRepository, CVAnalysisResultWriteRepository>();

            services.AddScoped<IReadRepository<Domain.Entities.KeywordMatch>, ReadRepository<Domain.Entities.KeywordMatch>>();
            services.AddScoped<IWriteRepository<Domain.Entities.KeywordMatch>, WriteRepository<Domain.Entities.KeywordMatch>>();
            services.AddScoped<IKeywordMatchReadRepository, KeywordMatchReadRepository>();
            services.AddScoped<IKeywordMatchWriteRepository, KeywordMatchWriteRepository>();

            services.AddScoped<IReadRepository<Domain.Entities.JobProfile>, ReadRepository<Domain.Entities.JobProfile>>();
            services.AddScoped<IWriteRepository<Domain.Entities.JobProfile>, WriteRepository<Domain.Entities.JobProfile>>();
            services.AddScoped<IJobProfileReadRepository, JobProfileReadRepository>();
            services.AddScoped<IJobProfileWriteRepository, JobProfileWriteRepository>();

            services.AddScoped<IReadRepository<Domain.Entities.Identity.RefreshToken>, ReadRepository<Domain.Entities.Identity.RefreshToken>>();
            services.AddScoped<IWriteRepository<Domain.Entities.Identity.RefreshToken>, WriteRepository<Domain.Entities.Identity.RefreshToken>>();
            services.AddScoped<IRefreshTokenReadRepository, RefreshTokenReadRepository>();
            services.AddScoped<IRefreshTokenWriteRepository, RefreshTokenWriteRepository>();

            services.AddScoped<IReadRepository<Domain.Entities.Activity>, ReadRepository<Domain.Entities.Activity>>();
            services.AddScoped<IWriteRepository<Domain.Entities.Activity>, WriteRepository<Domain.Entities.Activity>>();

            // Service registrations
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<ICommonService, CommonService>();
            services.AddScoped<ICVFileService, CVFileService>();
            services.AddScoped<IRefreshTokenService, RefreshTokenService>();
            services.AddScoped<IJobProfileService, JobProfileService>();
            services.AddScoped<ICVAnalysisService, CVAnalysisService>();
            services.AddScoped<IActivityService, ActivityService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            
            services.AddScoped<SeedDataService>();
        }
    }
}
