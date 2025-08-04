using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace CVisionBackend.Application.DTOs.Common
{
    public class CommonResponseMessage<T> where T : class 
    {
        public string? Title { get; set; }
        public string? Message { get; set; }
        public HttpStatusCode? StatusCode { get; set; }  // Enum olarak kullan
        public T? Data { get; set; }
    }
}
