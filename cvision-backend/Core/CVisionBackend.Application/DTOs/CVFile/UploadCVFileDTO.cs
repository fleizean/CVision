using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace CVisionBackend.Application.DTOs.CVFile
{
    public class UploadCVFileDTO
    {
        [Required(ErrorMessage = "File is required")]
        public IFormFile File { get; set; }
        
        public string? Description { get; set; }
    }
}