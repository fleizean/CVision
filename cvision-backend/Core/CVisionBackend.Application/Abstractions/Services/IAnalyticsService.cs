using CVisionBackend.Application.DTOs.Analytics;
using CVisionBackend.Application.DTOs.Common;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IAnalyticsService
    {
        Task<CommonResponseMessage<AnalyticsDataDTO>> GetAnalyticsDataAsync(string timeRange = "30days");
    }
}