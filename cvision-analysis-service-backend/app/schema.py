# ================================
# app/schemas.py
# ================================
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid

class CVFileResponse(BaseModel):
    id: str
    fileName: str
    filePath: str
    fileType: str
    analysisStatus: str
    uploadedAt: datetime
    userId: str

class KeywordMatchResponse(BaseModel):
    id: str
    keyword: str
    isMatched: bool
    matchCount: int

class CVAnalysisResponse(BaseModel):
    id: str
    cvFileId: str
    score: int
    missingSections: List[str]
    formatIssues: List[str]
    createdAt: datetime
    keywordMatches: List[KeywordMatchResponse]

class AnalyzeResponse(BaseModel):
    message: str
    cv_file_id: str
    status: str

class HealthCheckResponse(BaseModel):
    status: str
    message: str
    version: str

class StatisticsResponse(BaseModel):
    total_cvs: int
    pending_cvs: int
    completed_cvs: int
    failed_cvs: int
    processing_rate: float

class AnalysisRequest(BaseModel):
    cv_file_id: str
    job_profile_id: Optional[str] = None