using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.CVFile;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface ICVFileService
    {
        Task<CommonResponseMessage<UploadCVFileResponseDTO>> UploadCVFileAsync(UploadCVFileDTO uploadCVFileDTO, Guid userId);
        Task<CommonResponseMessage<List<GetCVFileDTO>>> GetUserFilesAsync(Guid userId);
        Task<CommonResponseMessage<GetCVFileDTO>> GetFileByIdAsync(Guid fileId);
        Task<CommonResponseMessage<GetCVFileDTO>> GetFileWithAnalysisAsync(Guid fileId);
        Task<CommonResponseMessage<object>> DeleteFileAsync(Guid fileId, Guid userId);
        Task<CommonResponseMessage<List<GetCVFileDTO>>> GetFilesByStatusAsync(string status);
        Task<CommonResponseMessage<object>> UpdateFileStatusAsync(Guid fileId, string status);
        Task<CommonResponseMessage<List<GetCVFileWithUserDTO>>> GetAllFilesWithUserInfoAsync();
    }
}