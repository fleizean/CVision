using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace CVisionBackend.API.Filters
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check if this is the file upload action specifically
            if (context.MethodInfo.Name == "UploadCVFile")
            {
                // Clear existing parameters
                operation.Parameters?.Clear();
                
                // Set up proper multipart/form-data request body
                operation.RequestBody = new OpenApiRequestBody
                {
                    Required = true,
                    Content = {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = {
                                    ["file"] = new OpenApiSchema
                                    {
                                        Type = "string",
                                        Format = "binary",
                                        Description = "CV file to upload (PDF, DOC, DOCX)"
                                    },
                                    ["description"] = new OpenApiSchema
                                    {
                                        Type = "string",
                                        Nullable = true,
                                        Description = "Optional description for the CV"
                                    }
                                },
                                Required = { "file" }
                            }
                        }
                    }
                };
            }
        }
    }
}