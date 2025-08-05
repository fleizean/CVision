using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.CVAnalysis;
using CVisionBackend.Application.Repositories.CVAnalysisResult;
using CVisionBackend.Application.Repositories.CVFile;
using CVisionBackend.Application.Repositories.KeywordMatch;
using CVisionBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CVisionBackend.Persistence.Services
{
    public class CVAnalysisService : ICVAnalysisService
    {
        private readonly ICVAnalysisResultReadRepository _analysisResultReadRepository;
        private readonly ICVAnalysisResultWriteRepository _analysisResultWriteRepository;
        private readonly ICVFileReadRepository _cvFileReadRepository;
        private readonly ICVFileWriteRepository _cvFileWriteRepository;
        private readonly IKeywordMatchReadRepository _keywordMatchReadRepository;

        public CVAnalysisService(
            ICVAnalysisResultReadRepository analysisResultReadRepository,
            ICVAnalysisResultWriteRepository analysisResultWriteRepository,
            ICVFileReadRepository cvFileReadRepository,
            ICVFileWriteRepository cvFileWriteRepository,
            IKeywordMatchReadRepository keywordMatchReadRepository)
        {
            _analysisResultReadRepository = analysisResultReadRepository;
            _analysisResultWriteRepository = analysisResultWriteRepository;
            _cvFileReadRepository = cvFileReadRepository;
            _cvFileWriteRepository = cvFileWriteRepository;
            _keywordMatchReadRepository = keywordMatchReadRepository;
        }

        public async Task<CommonResponseMessage<CreateAnalysisResponseDTO>> AnalyzeCVAsync(AnalyzeCVDTO analyzeCVDTO)
        {
            try
            {
                var analysisResult = new CVAnalysisResult
                {
                    CVFileId = analyzeCVDTO.FileId,
                    Score = 0,
                    FormatIssuesJson = "[]",
                    MissingSectionsJson = "[]"
                };

                await _analysisResultWriteRepository.AddAsync(analysisResult);
                await _analysisResultWriteRepository.SaveAsync();

                return new CommonResponseMessage<CreateAnalysisResponseDTO>
                {
                    StatusCode = HttpStatusCode.Created,
                                        Message = "CV analizi başlatıldı.",
                    Data = new CreateAnalysisResponseDTO
                    {
                        AnalysisResultId = analysisResult.Id,
                        Status = "Pending",
                        CreatedAt = analysisResult.CreatedAt ?? DateTime.UtcNow
                    }
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<CreateAnalysisResponseDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"CV analizi başlatılırken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<GetAnalysisResultDTO>> GetAnalysisResultAsync(Guid fileId)
        {
            try
            {
                var analysisResult = await _analysisResultReadRepository.GetAll()
                    .Include(ar => ar.CVFile)
                    .FirstOrDefaultAsync(ar => ar.CVFileId == fileId);

                if (analysisResult == null)
                {
                    return new CommonResponseMessage<GetAnalysisResultDTO>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "Bu dosya için analiz sonucu bulunamadı."
                    };
                }

                var keywordMatches = await _keywordMatchReadRepository.GetAll()
                    .Where(km => km.CVAnalysisResultId == analysisResult.Id)
                    .ToListAsync();

                return new CommonResponseMessage<GetAnalysisResultDTO>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Analiz sonucu başarıyla getirildi.",
                    Data = MapToGetAnalysisResultDTO(analysisResult, keywordMatches)
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<GetAnalysisResultDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Analiz sonucu getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<GetAnalysisResultDTO>> GetAnalysisResultByIdAsync(Guid analysisResultId)
        {
            try
            {
                var analysisResult = await _analysisResultReadRepository.GetAll()
                    .Include(ar => ar.CVFile)
                    .FirstOrDefaultAsync(ar => ar.Id == analysisResultId);

                if (analysisResult == null)
                {
                    return new CommonResponseMessage<GetAnalysisResultDTO>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "Analiz sonucu bulunamadı."
                    };
                }

                var keywordMatches = await _keywordMatchReadRepository.GetAll()
                    .Where(km => km.CVAnalysisResultId == analysisResult.Id)
                    .ToListAsync();

                return new CommonResponseMessage<GetAnalysisResultDTO>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Analiz sonucu başarıyla getirildi.",
                    Data = MapToGetAnalysisResultDTO(analysisResult, keywordMatches)
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<GetAnalysisResultDTO>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Analiz sonucu getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetAnalysisResultDTO>>> GetAnalysisResultsByScoreRangeAsync(int minScore, int maxScore)
        {
            try
            {
                var analysisResults = await _analysisResultReadRepository.GetAll()
                    .Include(ar => ar.CVFile)
                    .Where(ar => ar.Score >= minScore && ar.Score <= maxScore)
                    .OrderByDescending(ar => ar.CreatedAt)
                    .ToListAsync();

                var resultDTOs = new List<GetAnalysisResultDTO>();

                foreach (var result in analysisResults)
                {
                    var keywordMatches = await _keywordMatchReadRepository.GetAll()
                        .Where(km => km.CVAnalysisResultId == result.Id)
                        .ToListAsync();

                    resultDTOs.Add(MapToGetAnalysisResultDTO(result, keywordMatches));
                }

                return new CommonResponseMessage<List<GetAnalysisResultDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Skor aralığındaki analiz sonuçları başarıyla getirildi.",
                    Data = resultDTOs
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetAnalysisResultDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Analiz sonuçları getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<List<GetAnalysisResultDTO>>> GetAllAnalysisResultsAsync()
        {
            try
            {
                var analysisResults = await _analysisResultReadRepository.GetAll()
                    .Include(ar => ar.CVFile)
                    .OrderByDescending(ar => ar.CreatedAt)
                    .ToListAsync();

                var resultDTOs = new List<GetAnalysisResultDTO>();

                foreach (var result in analysisResults)
                {
                    var keywordMatches = await _keywordMatchReadRepository.GetAll()
                        .Where(km => km.CVAnalysisResultId == result.Id)
                        .ToListAsync();

                    resultDTOs.Add(MapToGetAnalysisResultDTO(result, keywordMatches));
                }

                return new CommonResponseMessage<List<GetAnalysisResultDTO>>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Tüm analiz sonuçları başarıyla getirildi.",
                    Data = resultDTOs
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<List<GetAnalysisResultDTO>>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Analiz sonuçları getirilirken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<object>> RetryAnalysisAsync(Guid fileId)
        {
            try
            {
                var cvFile = await _cvFileReadRepository.GetByIdAsync(fileId);

                if (cvFile == null)
                {
                    return new CommonResponseMessage<object>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                        Message = "CV dosyası bulunamadı."
                    };
                }

                // Get existing analysis result if exists
                var existingAnalysisResult = await _analysisResultReadRepository.GetAll()
                    .FirstOrDefaultAsync(ar => ar.CVFileId == fileId);

                if (existingAnalysisResult != null)
                {
                    // Remove existing analysis result and keyword matches
                    _analysisResultWriteRepository.Remove(existingAnalysisResult);
                }

                // Update CV file status to Pending
                cvFile.AnalysisStatus = "Pending";
                _cvFileWriteRepository.Update(cvFile);
                await _cvFileWriteRepository.SaveAsync();

                // Create new analysis result with pending status
                var newAnalysisResult = new CVAnalysisResult
                {
                    CVFileId = fileId,
                    Score = 0,
                    FormatIssuesJson = "[]",
                    MissingSectionsJson = "[]"
                };

                await _analysisResultWriteRepository.AddAsync(newAnalysisResult);
                await _analysisResultWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.OK,
                    Message = "CV analizi yeniden başlatıldı."
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                    Message = $"Analiz yeniden başlatılırken hata oluştu: {ex.Message}"
                };
            }
        }

        public async Task<CommonResponseMessage<object>> DeleteAnalysisResultAsync(Guid analysisResultId)
        {
            try
            {
                var analysisResult = await _analysisResultReadRepository.GetByIdAsync(analysisResultId);

                if (analysisResult == null)
                {
                    return new CommonResponseMessage<object>
                    {
                        StatusCode = HttpStatusCode.NotFound,
                                                Message = "Analiz sonucu bulunamadı."
                    };
                }

                _analysisResultWriteRepository.Remove(analysisResult);
                await _analysisResultWriteRepository.SaveAsync();

                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.OK,
                                        Message = "Analiz sonucu başarıyla silindi."
                };
            }
            catch (Exception ex)
            {
                return new CommonResponseMessage<object>
                {
                    StatusCode = HttpStatusCode.InternalServerError,
                                        Message = $"Analiz sonucu silinirken hata oluştu: {ex.Message}"
                };
            }
        }

        private GetAnalysisResultDTO MapToGetAnalysisResultDTO(CVAnalysisResult analysisResult, List<KeywordMatch> keywordMatches)
        {
            return new GetAnalysisResultDTO
            {
                Id = analysisResult.Id,
                CVFileId = analysisResult.CVFileId,
                CVFileName = analysisResult.CVFile?.FileName ?? "Bilinmeyen Dosya",
                AnalysisDate = analysisResult.CreatedAt ?? DateTime.UtcNow,
                OverallScore = analysisResult.Score,
                ProcessingStatus = "Completed",
                KeywordMatches = keywordMatches.Select(km => new KeywordMatchDTO
                {
                    Keyword = km.Keyword,
                    Count = km.Count,
                    Relevance = km.Relevance
                }).ToList()
            };
        }
    }
}