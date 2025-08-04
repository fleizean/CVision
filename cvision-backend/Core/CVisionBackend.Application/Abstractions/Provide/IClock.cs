using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Provide
{
    public interface IClock
    {
        DateTime Now { get; }
    }
}
