using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Common
{
    public class CommonListObject<T> where T : class
    {
        public List<T> Lists { get; set; }
        public int TotalCount { get; set; }
    }
}
