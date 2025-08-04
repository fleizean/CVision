using CVisionBackend.Application.Abstractions.Provide;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeZoneConverter;

namespace CVisionBackend.Infrastructure.Provide
{
    public class ClockProvider : IClock
    {
        private readonly TimeZoneInfo _tz = TZConvert.GetTimeZoneInfo("Europe/Istanbul");
        public DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _tz);
    }
}
