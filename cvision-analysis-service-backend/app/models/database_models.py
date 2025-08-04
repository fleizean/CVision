
# ================================
# app/models.py
# ================================
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime
from typing import List
import json

class CVFileModel(Base):
    """CV File model matching .NET Entity"""
    __tablename__ = "CVFiles"
    
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    UserId = Column(UNIQUEIDENTIFIER, nullable=False)
    FileName = Column(String(255), nullable=False)
    FilePath = Column(String(500), nullable=False)
    FileType = Column(String(10), nullable=False)  # pdf, docx
    ParsedText = Column(Text, nullable=True)
    AnalysisStatus = Column(String(50), nullable=False, default="Pending")  # Pending, Completed, Failed
    UploadedAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    CreatedAt = Column(DateTime, nullable=True, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=True)
    IsDeleted = Column(Boolean, nullable=False, default=False)
    
    # Relationship
    analysis_result = relationship("CVAnalysisResultModel", back_populates="cv_file", uselist=False)

class CVAnalysisResultModel(Base):
    """CV Analysis Result model matching .NET Entity"""
    __tablename__ = "CVAnalysisResults"
    
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    CVFileId = Column(UNIQUEIDENTIFIER, ForeignKey("CVFiles.Id"), nullable=False, unique=True)
    Score = Column(Integer, nullable=False, default=0)
    MissingSectionsJson = Column(Text, nullable=False, default="[]")
    FormatIssuesJson = Column(Text, nullable=False, default="[]")
    CreatedAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=True)
    IsDeleted = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    cv_file = relationship("CVFileModel", back_populates="analysis_result")
    keyword_matches = relationship("KeywordMatchModel", back_populates="analysis_result")
    
    @property
    def MissingSections(self) -> List[str]:
        """Parse JSON string to list"""
        try:
            return json.loads(self.MissingSectionsJson) if self.MissingSectionsJson else []
        except json.JSONDecodeError:
            return []
    
    @MissingSections.setter
    def MissingSections(self, value: List[str]):
        """Convert list to JSON string"""
        self.MissingSectionsJson = json.dumps(value)
    
    @property
    def FormatIssues(self) -> List[str]:
        """Parse JSON string to list"""
        try:
            return json.loads(self.FormatIssuesJson) if self.FormatIssuesJson else []
        except json.JSONDecodeError:
            return []
    
    @FormatIssues.setter
    def FormatIssues(self, value: List[str]):
        """Convert list to JSON string"""
        self.FormatIssuesJson = json.dumps(value)

class KeywordMatchModel(Base):
    """Keyword Match model matching .NET Entity"""
    __tablename__ = "KeywordMatches"
    
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    CVAnalysisResultId = Column(UNIQUEIDENTIFIER, ForeignKey("CVAnalysisResults.Id"), nullable=False)
    Keyword = Column(String(255), nullable=False)
    IsMatched = Column(Boolean, nullable=False, default=False)
    Count = Column(Integer, nullable=False, default=0)
    MatchCount = Column(Integer, nullable=False, default=0)
    Relevance = Column(Integer, nullable=False, default=0)  # Using Integer for relevance (0-100)
    CreatedAt = Column(DateTime, nullable=True, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=True)
    IsDeleted = Column(Boolean, nullable=False, default=False)
    
    # Relationship
    analysis_result = relationship("CVAnalysisResultModel", back_populates="keyword_matches")

class JobProfileModel(Base):
    """Job Profile model matching .NET Entity"""
    __tablename__ = "JobProfiles"
    
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    Title = Column(String(255), nullable=False)
    SuggestedKeywordsJson = Column(Text, nullable=False, default="[]")
    CreatedAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=True)
    IsDeleted = Column(Boolean, nullable=False, default=False)
    
    @property
    def SuggestedKeywords(self) -> List[str]:
        """Parse JSON string to list"""
        try:
            return json.loads(self.SuggestedKeywordsJson) if self.SuggestedKeywordsJson else []
        except json.JSONDecodeError:
            return []
    
    @SuggestedKeywords.setter
    def SuggestedKeywords(self, value: List[str]):
        """Convert list to JSON string"""
        self.SuggestedKeywordsJson = json.dumps(value)