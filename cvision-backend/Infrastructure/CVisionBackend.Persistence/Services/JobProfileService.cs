using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.JobProfile;
using CVisionBackend.Application.Repositories.JobProfile;
using CVisionBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class JobProfileService : IJobProfileService
    {
        private readonly IJobProfileReadRepository _jobProfileReadRepository;
        private readonly IJobProfileWriteRepository _jobProfileWriteRepository;

        public JobProfileService(IJobProfileReadRepository jobProfileReadRepository, IJobProfileWriteRepository jobProfileWriteRepository)
        {
            _jobProfileReadRepository = jobProfileReadRepository;
            _jobProfileWriteRepository = jobProfileWriteRepository;
        }

        public async Task<CommonResponseMessage<CreateJobProfileResponseDTO>> CreateJobProfileAsync(CreateJobProfileDTO createJobProfileDTO)
        {
            try
            {
                var existingProfile = await _jobProfileReadRepository.GetAll()
                    .FirstOrDefaultAsync(jp => jp.Title.ToLower() == createJobProfileDTO.Title.ToLower());

                if (existingProfile != null)
                {
                    return new CommonResponseMessage<CreateJobProfileResponseDTO>
                    {
                        StatusCode = HttpStatusCode.Conflict,
                        Message = "Bu başlıkla bir iş profili zaten mevcut."
                    };
                }

                var jobProfile = new JobProfile
                {
                    Title = createJobProfileDTO.Title,
                    SuggestedKeywords = createJobProfileDTO.SuggestedKeywords ?? new List<string>(),
                    CreatedAt = DateTime.UtcNow
                };

                await _jobProfileWriteRepository.AddAsync(jobProfile);
                await _jobProfileWriteRepository.SaveAsync();

                return new CommonResponseMessage<CreateJobProfileResponseDTO>
                {
                    StatusCode = HttpStatusCode.Created,
                    Message = "İş profili başarıyla oluşturuldu.",
                    Data = new CreateJobProfileResponseDTO
                    {
                        Id = jobProfile.Id,
                        Title = jobProfile.Title,
                        SuggestedKeywords = jobProfile.SuggestedKeywords,
                        CreatedAt = jobProfile.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<CreateJobProfileResponseDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"İş profili oluşturulurken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<GetJobProfileDTO>> GetJobProfileByIdAsync(Guid profileId)
        {
            try
            {
                var jobProfile = await _jobProfileReadRepository.GetByIdAsync(profileId);

                if (jobProfile == null)
                {
                    return new CommonResponseMessage<GetJobProfileDTO>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "İş profili bulunamadı."
                    };
                }

                return new CommonResponseMessage<GetJobProfileDTO>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "İş profili başarıyla getirildi.",
                    Data = new GetJobProfileDTO
                    {
                        Id = jobProfile.Id,
                        Title = jobProfile.Title,
                        SuggestedKeywords = jobProfile.SuggestedKeywords,
                        CreatedAt = jobProfile.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<GetJobProfileDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"İş profili getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetAllJobProfilesAsync()
        {
            try
            {
                var jobProfiles = await _jobProfileReadRepository.GetAll()
                    .OrderByDescending(jp => jp.CreatedAt)
                    .ToListAsync();

                var jobProfileDTOs = jobProfiles.Select(jp => new GetJobProfileDTO
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    SuggestedKeywords = jp.SuggestedKeywords,
                    CreatedAt = jp.CreatedAt
                }).ToList();

                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "İş profilleri başarıyla getirildi.",
                    Data = jobProfileDTOs
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"İş profilleri getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetJobProfilesByTitleAsync(string title)
        {
            try
            {
                var jobProfiles = await _jobProfileReadRepository.GetAll()
                    .Where(jp => jp.Title.ToLower().Contains(title.ToLower()))
                    .OrderByDescending(jp => jp.CreatedAt)
                    .ToListAsync();

                var jobProfileDTOs = jobProfiles.Select(jp => new GetJobProfileDTO
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    SuggestedKeywords = jp.SuggestedKeywords,
                    CreatedAt = jp.CreatedAt
                }).ToList();

                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "İş profilleri başarıyla getirildi.",
                    Data = jobProfileDTOs
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"İş profilleri getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetJobProfileDTO>>> GetRecentJobProfilesAsync(int count = 10)
        {
            try
            {
                var jobProfiles = await _jobProfileReadRepository.GetAll()
                    .OrderByDescending(jp => jp.CreatedAt)
                    .Take(count)
                    .ToListAsync();

                var jobProfileDTOs = jobProfiles.Select(jp => new GetJobProfileDTO
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    SuggestedKeywords = jp.SuggestedKeywords,
                    CreatedAt = jp.CreatedAt
                }).ToList();

                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Son iş profilleri başarıyla getirildi.",
                    Data = jobProfileDTOs
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetJobProfileDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Son iş profilleri getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<UpdateJobProfileResponseDTO>> UpdateJobProfileAsync(UpdateJobProfileDTO updateJobProfileDTO)
        {
            try
            {
                var jobProfile = await _jobProfileReadRepository.GetByIdAsync(updateJobProfileDTO.Id);

                if (jobProfile == null)
                {
                    return new CommonResponseMessage<UpdateJobProfileResponseDTO>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "İş profili bulunamadı."
                    };
                }

                var existingProfile = await _jobProfileReadRepository.GetAll()
                    .FirstOrDefaultAsync(jp => jp.Title.ToLower() == updateJobProfileDTO.Title.ToLower() && jp.Id != updateJobProfileDTO.Id);

                if (existingProfile != null)
                {
                    return new CommonResponseMessage<UpdateJobProfileResponseDTO>
                    {
                        StatusCode = HttpStatusCode.Conflict,
                                                Message = "Bu başlıkla başka bir iş profili zaten mevcut."
                    };
                }

                jobProfile.Title = updateJobProfileDTO.Title;
                jobProfile.SuggestedKeywords = updateJobProfileDTO.SuggestedKeywords ?? new List<string>();

                _jobProfileWriteRepository.Update(jobProfile);
                await _jobProfileWriteRepository.SaveAsync();

                return new CommonResponseMessage<UpdateJobProfileResponseDTO>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "İş profili başarıyla güncellendi.",
                    Data = new UpdateJobProfileResponseDTO
                    {
                        Id = jobProfile.Id,
                        Title = jobProfile.Title,
                        SuggestedKeywords = jobProfile.SuggestedKeywords,
                        UpdatedAt = DateTime.UtcNow
                    }
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<UpdateJobProfileResponseDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"İş profili güncellenirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<object>> DeleteJobProfileAsync(Guid profileId)
        {
            try
            {
                var jobProfile = await _jobProfileReadRepository.GetByIdAsync(profileId);

                if (jobProfile == null)
                {
                    return new CommonResponseMessage<object>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "İş profili bulunamadı."
                    };
                }

                _jobProfileWriteRepository.Remove(jobProfile);
                await _jobProfileWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "İş profili başarıyla silindi."
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"İş profili silinirken hata oluştu: {ex.Message}"
                };
            }
        }
    }
}