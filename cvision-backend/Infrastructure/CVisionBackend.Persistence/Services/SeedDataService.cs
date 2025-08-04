using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using CVisionBackend.Domain.Entities.Identity;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class SeedDataService
    {
        private readonly IServiceProvider _serviceProvider;

        public SeedDataService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task SeedAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();
            var context = scope.ServiceProvider.GetRequiredService<CVisionDbContext>();

            // Sırayla seed işlemlerini gerçekleştir
        }

        
    }
}