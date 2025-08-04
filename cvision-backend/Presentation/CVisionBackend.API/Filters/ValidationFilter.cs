using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using CVisionBackend.Application.DTOs.Common;
using System.Net;

namespace CVisionBackend.API.Filters
{
    public class ValidationFilter : IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();


                var response = new CommonResponseMessage<object>
                {
                    Title = "Doğrulama Hatası",
                    Message = string.Join("\n", errors),  // Hataları alt alta yaz
                    StatusCode = HttpStatusCode.BadRequest,
                    Data = null
                };

                context.Result = new BadRequestObjectResult(response);
            }
        }

    }
}
