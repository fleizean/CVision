using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.JobProfile;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CVisionBackend.Application.Abstractions.Services
{
    public interface IJobProfileService
    {
        Task<CommonResponseMessage<CreateJobProfileResponseDTO>> CreateJobProfileAsync(CreateJobProfileDTO createJobProfileDTO);
        Task<CommonResponseMessage<GetJobProfileDTO>> GetJobProfileByIdAsync(Guid profileId);
        Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetAllJobProfilesAsync();
        Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetJobProfilesByTitleAsync(string title);
        Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetRecentJobProfilesAsync(int count = 10);
        Task<CommonResponseMessage<UpdateJobProfileResponseDTO>> UpdateJobProfileAsync(UpdateJobProfileDTO updateJobProfileDTO);
        Task<CommonResponseMessage<object>> DeleteJobProfileAsync(Guid profileId);
    }
}