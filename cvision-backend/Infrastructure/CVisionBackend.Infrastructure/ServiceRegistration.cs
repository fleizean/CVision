using Microsoft.Extensions.DependencyInjection;
using CVisionBackend.Application.Abstractions.Provide;
using CVisionBackend.Application.Abstractions.Token;
using CVisionBackend.Infrastructure.Provide;
using CVisionBackend.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Infrastructure
{
    public static class ServiceRegistration
    {
        public static void AddInfrastructureServices(this IServiceCollection serviceCollection)
        {
            serviceCollection.AddScoped<ITokenHandler, TokenHandler>();
            serviceCollection.AddSingleton<IClock, ClockProvider>();
        }
    }
}
