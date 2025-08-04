using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.CVFile;
using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Domain.Entities;
using CVisionBackend.Domain.Entities.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class CVFileService : ICVFileService
    {
        private readonly ICVFileReadRepository _cvFileReadRepository;
        private readonly ICVFileWriteRepository _cvFileWriteRepository;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IActivityService _activityService;
        private readonly UserManager<AppUser> _userManager;

        public CVFileService(
            ICVFileReadRepository cvFileReadRepository,
            ICVFileWriteRepository cvFileWriteRepository,
            IWebHostEnvironment webHostEnvironment,
            IActivityService activityService,
            UserManager<AppUser> userManager)
        {
            _cvFileReadRepository = cvFileReadRepository;
            _cvFileWriteRepository = cvFileWriteRepository;
            _webHostEnvironment = webHostEnvironment;
            _activityService = activityService;
            _userManager = userManager;
        }

        public async Task<CommonResponseMessage<UploadCVFileResponseDTO>> UploadCVFileAsync(UploadCVFileDTO uploadCVFileDTO, Guid userId)
        {
            try
            {
                if (uploadCVFileDTO.File == null || uploadCVFileDTO.File.Length == 0)
                {
                    return new CommonResponseMessage<UploadCVFileResponseDTO>
                    {
                        Title = "File Upload",
                        Message = "No file was uploaded.",
                        StatusCode = HttpStatusCode.BadRequest
                    };
                }

                // Create upload directory if it doesn't exist
                var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "uploads", "cvfiles");
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileExtension = Path.GetExtension(uploadCVFileDTO.File.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, uniqueFileName);

                // Save file to disk
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await uploadCVFileDTO.File.CopyToAsync(fileStream);
                }

                // Extract text from file (placeholder - implement actual text extraction)
                var parsedText = await ExtractTextFromFile(filePath, fileExtension);

                // Create CVFile entity
                var cvFile = new CVFile
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    FileName = uploadCVFileDTO.File.FileName,
                    FilePath = filePath,
                    FileType = fileExtension.ToLower(),
                    ParsedText = parsedText,
                    AnalysisStatus = "Pending",
                    UploadedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                await _cvFileWriteRepository.AddAsync(cvFile);
                await _cvFileWriteRepository.SaveAsync();

                // Log activity
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user != null)
                {
                    await _activityService.LogUserActivityAsync(
                        userId,
                        $"{user.Name} {user.Surname}",
                        user.Email,
                        ActivityType.CVFileUploaded,
                        $"CV file uploaded: {cvFile.FileName}",
                        System.Text.Json.JsonSerializer.Serialize(new { FileName = cvFile.FileName, FileType = cvFile.FileType, FileSize = uploadCVFileDTO.File.Length }),
                        cvFile.Id.ToString(),
                        "CVFile"
                    );
                }

                var response = new UploadCVFileResponseDTO
                {
                    FileId = cvFile.Id,
                    FileName = cvFile.FileName,
                    FileType = cvFile.FileType,
                    AnalysisStatus = cvFile.AnalysisStatus,
                    UploadedAt = cvFile.UploadedAt
                };

                return new CommonResponseMessage<UploadCVFileResponseDTO>
                {
                    Title = "File Upload",
                    Message = "File uploaded successfully.",
                    StatusCode = HttpStatusCode.Created,
                    Data = response
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<UploadCVFileResponseDTO>
                {
                    Title = "File Upload",
                    Message = $"An error occurred while uploading the file: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetCVFileDTO>>> GetUserFilesAsync(Guid userId)
        {
            try
            {
                var files = await _cvFileReadRepository.GetFilesByUserIdAsync(userId, false);
                
                var fileDtos = files.Select(f => new GetCVFileDTO
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FileType = f.FileType,
                    AnalysisStatus = f.AnalysisStatus,
                    UploadedAt = f.UploadedAt,
                    HasAnalysis = f.AnalysisResult != null,
                    AnalysisScore = f.AnalysisResult?.Score
                }).ToList();

                return new CommonResponseMessage<List<GetCVFileDTO>>
                {
                    Title = "User Files",
                    Message = "Files retrieved successfully.",
                    StatusCode = HttpStatusCode.OK,
                    Data = fileDtos
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetCVFileDTO>>
                {
                    Title = "User Files",
                    Message = $"An error occurred while retrieving files: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<GetCVFileDTO>> GetFileByIdAsync(Guid fileId)
        {
            try
            {
                var file = await _cvFileReadRepository.GetByIdAsync(fileId, false);
                if (file == null)
                {
                    return new CommonResponseMessage<GetCVFileDTO>
                    {
                        Title = "File Not Found",
                        Message = "The requested file was not found.",
                        StatusCode = HttpStatusCode.NotFound
                    };
                }

                var fileDto = new GetCVFileDTO
                {
                    Id = file.Id,
                    FileName = file.FileName,
                    FileType = file.FileType,
                    AnalysisStatus = file.AnalysisStatus,
                    UploadedAt = file.UploadedAt,
                    HasAnalysis = file.AnalysisResult != null,
                    AnalysisScore = file.AnalysisResult?.Score
                };

                return new CommonResponseMessage<GetCVFileDTO>
                {
                    Title = "File Details",
                    Message = "File retrieved successfully.",
                    StatusCode = HttpStatusCode.OK,
                    Data = fileDto
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<GetCVFileDTO>
                {
                    Title = "File Details",
                    Message = $"An error occurred while retrieving the file: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<GetCVFileDTO>> GetFileWithAnalysisAsync(Guid fileId)
        {
            try
            {
                var file = await _cvFileReadRepository.GetFileWithAnalysisAsync(fileId, false);
                if (file == null)
                {
                    return new CommonResponseMessage<GetCVFileDTO>
                    {
                        Title = "File Not Found",
                        Message = "The requested file was not found.",
                        StatusCode = HttpStatusCode.NotFound
                    };
                }

                var fileDto = new GetCVFileDTO
                {
                    Id = file.Id,
                    FileName = file.FileName,
                    FileType = file.FileType,
                    AnalysisStatus = file.AnalysisStatus,
                    UploadedAt = file.UploadedAt,
                    HasAnalysis = file.AnalysisResult != null,
                    AnalysisScore = file.AnalysisResult?.Score
                };

                return new CommonResponseMessage<GetCVFileDTO>
                {
                    Title = "File with Analysis",
                    Message = "File and analysis retrieved successfully.",
                    StatusCode = HttpStatusCode.OK,
                    Data = fileDto
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<GetCVFileDTO>
                {
                    Title = "File with Analysis",
                    Message = $"An error occurred while retrieving the file: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<object>> DeleteFileAsync(Guid fileId, Guid userId)
        {
            try
            {
                var file = await _cvFileReadRepository.GetByIdAsync(fileId);
                if (file == null)
                {
                    return new CommonResponseMessage<object>
                    {
                        Title = "File Not Found",
                        Message = "The requested file was not found.",
                        StatusCode = HttpStatusCode.NotFound
                    };
                }

                if (file.UserId != userId)
                {
                    return new CommonResponseMessage<object>
                    {
                        Title = "Unauthorized",
                        Message = "You are not authorized to delete this file.",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }

                // Delete physical file
                if (File.Exists(file.FilePath))
                {
                    File.Delete(file.FilePath);
                }

                // Delete from database
                _cvFileWriteRepository.Remove(file);
                await _cvFileWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    Title = "File Deleted",
                    Message = "File deleted successfully.",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "File Deletion",
                    Message = $"An error occurred while deleting the file: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetCVFileDTO>>> GetFilesByStatusAsync(string status)
        {
            try
            {
                var files = await _cvFileReadRepository.GetFilesByStatusAsync(status, false);
                
                var fileDtos = files.Select(f => new GetCVFileDTO
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FileType = f.FileType,
                    AnalysisStatus = f.AnalysisStatus,
                    UploadedAt = f.UploadedAt,
                    HasAnalysis = f.AnalysisResult != null,
                    AnalysisScore = f.AnalysisResult?.Score
                }).ToList();

                return new CommonResponseMessage<List<GetCVFileDTO>>
                {
                    Title = "Files by Status",
                    Message = "Files retrieved successfully.",
                    StatusCode = HttpStatusCode.OK,
                    Data = fileDtos
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetCVFileDTO>>
                {
                    Title = "Files by Status",
                    Message = $"An error occurred while retrieving files: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<object>> UpdateFileStatusAsync(Guid fileId, string status)
        {
            try
            {
                var file = await _cvFileReadRepository.GetByIdAsync(fileId);
                if (file == null)
                {
                    return new CommonResponseMessage<object>
                    {
                        Title = "File Not Found",
                        Message = "The requested file was not found.",
                        StatusCode = HttpStatusCode.NotFound
                    };
                }

                file.AnalysisStatus = status;
                file.UpdatedAt = DateTime.UtcNow;

                _cvFileWriteRepository.Update(file);
                await _cvFileWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    Title = "Status Updated",
                    Message = "File status updated successfully.",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    Title = "Status Update",
                    Message = $"An error occurred while updating file status: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetCVFileWithUserDTO>>> GetAllFilesWithUserInfoAsync()
        {
            try
            {
                var files = _cvFileReadRepository.GetAll(false).Include(f => f.AnalysisResult).ToList();
                
                var fileDtos = new List<GetCVFileWithUserDTO>();
                
                foreach (var file in files)
                {
                    var user = await _userManager.FindByIdAsync(file.UserId.ToString());
                    
                    var fileDto = new GetCVFileWithUserDTO
                    {
                        Id = file.Id,
                        UserId = file.UserId,
                        FileName = file.FileName,
                        FileType = file.FileType,
                        AnalysisStatus = file.AnalysisStatus,
                        UploadedAt = file.UploadedAt,
                        HasAnalysis = file.AnalysisResult != null,
                        AnalysisScore = file.AnalysisResult?.Score,
                        UserName = user?.UserName ?? "Unknown",
                        UserEmail = user?.Email ?? "Unknown",
                        UserFullName = user != null ? $"{user.Name} {user.Surname}" : "Unknown User"
                    };
                    
                    fileDtos.Add(fileDto);
                }

                return new CommonResponseMessage<List<GetCVFileWithUserDTO>>
                {
                    Title = "All Files with User Info",
                    Message = "Files with user information retrieved successfully.",
                    StatusCode = HttpStatusCode.OK,
                    Data = fileDtos
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetCVFileWithUserDTO>>
                {
                    Title = "All Files with User Info",
                    Message = $"An error occurred while retrieving files: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                };
            }
        }

        private async Task<string> ExtractTextFromFile(string filePath, string fileExtension)
        {
            // Placeholder for text extraction logic
            // TODO: Implement actual text extraction using libraries like:
            // - iTextSharp for PDF
            // - DocumentFormat.OpenXml for Word documents
            await Task.Delay(100); // Simulate processing time
            return "Sample extracted text content...";
        }
    }
}