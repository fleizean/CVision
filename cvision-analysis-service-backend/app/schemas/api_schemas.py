# ================================
# app/schemas/api_schemas.py
# ================================
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Health Check Schemas
class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Status message")
    version: str = Field(..., description="Service version")
    database: Optional[str] = Field(None, description="Database status")

# CV Analysis Schemas
class CVAnalysisRequest(BaseModel):
    cv_file_id: str = Field(..., description="CV file ID to analyze")

class CVAnalysisResponse(BaseModel):
    cv_file_id: str = Field(..., description="CV file ID")
    status: str = Field(..., description="Analysis status")
    message: str = Field(..., description="Response message")

class AnalyzeResponse(BaseModel):
    message: str = Field(..., description="Response message")
    status: str = Field(..., description="Analysis status")

class CVFileResponse(BaseModel):
    id: str = Field(..., description="CV file ID")
    fileName: str = Field(..., description="Original filename")
    filePath: str = Field(..., description="File path")
    fileType: str = Field(..., description="File type")
    analysisStatus: str = Field(..., description="Analysis status")
    uploadedAt: datetime = Field(..., description="Upload timestamp")
    userId: str = Field(..., description="User ID")
    
    class Config:
        from_attributes = True

class CVAnalysisResultResponse(BaseModel):
    id: str = Field(..., description="Analysis result ID")
    cv_file_id: str = Field(..., description="CV file ID")
    score: int = Field(..., description="Overall CV score")
    missing_sections: List[str] = Field(..., description="Missing CV sections")
    format_issues: List[str] = Field(..., description="Format issues found")
    created_at: datetime = Field(..., description="Analysis creation time")
    
    class Config:
        from_attributes = True

# File Processing Schemas
class PendingCVResponse(BaseModel):
    id: str = Field(..., description="CV file ID")
    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="File type")
    uploaded_at: datetime = Field(..., description="Upload timestamp")
    analysis_status: str = Field(..., description="Current analysis status")
    
    class Config:
        from_attributes = True

# Statistics Schemas
class ProcessingStats(BaseModel):
    is_running: bool = Field(..., description="Whether processor is running")
    processed_count: int = Field(..., description="Total processed CVs")
    failed_count: int = Field(..., description="Total failed CVs")
    success_rate: float = Field(..., description="Success rate percentage")

class ServiceStats(BaseModel):
    total_cvs: int = Field(..., description="Total CVs in database")
    pending_cvs: int = Field(..., description="Pending CVs")
    completed_cvs: int = Field(..., description="Completed CVs")
    failed_cvs: int = Field(..., description="Failed CVs")
    average_score: Optional[float] = Field(None, description="Average CV score")
    processor_stats: ProcessingStats = Field(..., description="Background processor stats")

# Error Response Schema
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

# Job Profile Matching Schemas
class JobProfileMatch(BaseModel):
    job_profile_id: str = Field(..., description="Job profile ID")
    similarity_score: float = Field(..., description="Similarity score (0-1)")
    title: str = Field(..., description="Job profile title")

class CVJobMatchResponse(BaseModel):
    cv_file_id: str = Field(..., description="CV file ID")
    matches: List[JobProfileMatch] = Field(..., description="Job profile matches")
    
# Keyword Analysis Schemas
class KeywordMatch(BaseModel):
    keyword: str = Field(..., description="Matched keyword")
    count: int = Field(..., description="Number of matches")
    confidence: float = Field(..., description="Match confidence")

class KeywordAnalysisResponse(BaseModel):
    cv_file_id: str = Field(..., description="CV file ID")
    matched_keywords: List[KeywordMatch] = Field(..., description="Matched keywords")
    total_matches: int = Field(..., description="Total keyword matches")
    match_percentage: float = Field(..., description="Percentage of keywords matched")

# Advanced Job Matching Schemas
class JobMatchResponse(BaseModel):
    cv_id: str = Field(..., description="CV ID")
    job_profile_id: str = Field(..., description="Job profile ID")
    cv_title: str = Field(..., description="CV title/filename")
    job_title: str = Field(..., description="Job profile title")
    match_percentage: float = Field(..., description="Overall match percentage")
    total_job_keywords: int = Field(..., description="Total keywords in job profile")
    matched_keywords: List[str] = Field(..., description="Matched keywords")
    missing_keywords: List[str] = Field(..., description="Missing keywords from CV")
    extra_keywords: List[str] = Field(..., description="Extra keywords in CV")
    semantic_similarity: float = Field(..., description="Semantic similarity score")
    weighted_score: float = Field(..., description="Weighted matching score")
    category_scores: Dict[str, Any] = Field(..., description="Category-based scores")
    recommendations: List[str] = Field(..., description="Improvement recommendations")

class JobProfileMatchSummary(BaseModel):
    job_profile_id: str = Field(..., description="Job profile ID")
    job_title: str = Field(..., description="Job profile title")
    match_percentage: float = Field(..., description="Match percentage")
    total_job_keywords: int = Field(..., description="Total job keywords")
    matched_keywords_count: int = Field(..., description="Count of matched keywords")
    matched_keywords: List[str] = Field(..., description="Matched keywords")
    missing_keywords: List[str] = Field(..., description="Missing keywords")
    semantic_similarity: Optional[float] = Field(None, description="Semantic similarity")
    weighted_score: Optional[float] = Field(None, description="Weighted score")
    category_scores: Optional[Dict[str, Any]] = Field(None, description="Category scores")

class CVAllJobsMatchResponse(BaseModel):
    cv_id: str = Field(..., description="CV ID")
    cv_title: str = Field(..., description="CV title/filename")
    total_job_profiles: int = Field(..., description="Total job profiles analyzed")
    matches: List[JobProfileMatchSummary] = Field(..., description="All job matches")
    best_match: Optional[JobProfileMatchSummary] = Field(None, description="Best matching job")
    average_match_percentage: float = Field(..., description="Average match percentage")

class CVMatchSummary(BaseModel):
    cv_id: str = Field(..., description="CV ID")
    cv_file_name: str = Field(..., description="CV filename")
    match_percentage: float = Field(..., description="Match percentage")
    total_job_keywords: int = Field(..., description="Total job keywords")
    matched_keywords_count: int = Field(..., description="Matched keywords count")
    matched_keywords: List[str] = Field(..., description="Matched keywords")
    analysis_date: datetime = Field(..., description="CV analysis date")
    semantic_similarity: Optional[float] = Field(None, description="Semantic similarity")
    weighted_score: Optional[float] = Field(None, description="Weighted score")
    cv_score: int = Field(..., description="Overall CV score")

class TopCVMatchesResponse(BaseModel):
    job_profile_id: str = Field(..., description="Job profile ID")
    job_title: str = Field(..., description="Job profile title")
    total_cvs_analyzed: int = Field(..., description="Total CVs analyzed")
    top_matches: List[CVMatchSummary] = Field(..., description="Top CV matches")
    average_match_percentage: float = Field(..., description="Average match percentage")

# Generic API Response wrapper
from typing import TypeVar, Generic
T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    status_code: int = Field(..., description="HTTP status code")
    message: str = Field(..., description="Response message")
    data: Optional[T] = Field(None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    
    class Config:
        arbitrary_types_allowed = True