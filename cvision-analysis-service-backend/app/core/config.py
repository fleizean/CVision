# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "CV Analysis Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Database settings (using pymssql instead of pyodbc)
    DATABASE_URL: str = "mssql+pymssql://sa:reallyStrongPassword1!@localhost:1433/cvisionDb"
    
    # Alternative individual database components
    DB_SERVER: str = "localhost"
    DB_PORT: int = 1433
    DB_NAME: str = "cvisionDb"
    DB_USER: str = "sa"
    DB_PASSWORD: str = "reallyStrongPassword1!"
    DB_DRIVER: str = "ODBC Driver 18 for SQL Server"
    DB_TRUST_CERT: str = "yes"
    
    # File processing settings
    UPLOAD_FOLDER: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".doc"]
    
    # Analysis settings
    BATCH_SIZE: int = 5  # Number of CVs to process in one batch
    PROCESSING_INTERVAL: int = 30  # Seconds between batch processing
    MAX_RETRIES: int = 3
    
    # NLP Model settings
    SPACY_MODEL: str = "en_core_web_sm"
    
    # CV Analysis scoring weights
    SKILLS_WEIGHT: float = 0.4
    EXPERIENCE_WEIGHT: float = 0.3
    EDUCATION_WEIGHT: float = 0.2
    FORMAT_WEIGHT: float = 0.1
    
    # Keyword matching settings
    MIN_KEYWORD_CONFIDENCE: float = 0.7
    FUZZY_MATCH_THRESHOLD: int = 80
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/cv_analysis.log"
    
    # Redis settings (for future Celery integration)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API Keys (for future AI integrations)
    OPENAI_API_KEY: Optional[str] = None
    
    # .NET API integration
    DOTNET_API_URL: str = "http://localhost:5117/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_database_url(self) -> str:
        """Generate database URL from components"""
        return f"mssql+pyodbc://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_SERVER}:{self.DB_PORT}/{self.DB_NAME}?driver={self.DB_DRIVER.replace(' ', '+')}&TrustServerCertificate={self.DB_TRUST_CERT}"

# Create settings instance
settings = Settings()