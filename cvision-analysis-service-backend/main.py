from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import asyncio

from app.database import init_db
from app.services.pending_processor import PendingCVProcessor
from app.core.config import settings
from app.api.endpoints import health, analysis, monitoring, job_matching

# Logging konfigürasyonu
logger.add(
    "logs/cv_analysis_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="30 days",
    level="INFO"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting CV Analysis Service...")
    init_db()
    
    # Background processor'ı başlat
    processor = PendingCVProcessor()
    task = asyncio.create_task(processor.start_processing())
    
    yield
    
    logger.info("Shutting down CV Analysis Service...")
    task.cancel()

# FastAPI app oluştur
app = FastAPI(
    title="CV Analysis Service",
    description="Python FastAPI service for analyzing CVs",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5117"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route'ları ekle
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(monitoring.router, prefix="/api", tags=["monitoring"])
app.include_router(job_matching.router, prefix="/api/job-matching", tags=["job-matching"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )