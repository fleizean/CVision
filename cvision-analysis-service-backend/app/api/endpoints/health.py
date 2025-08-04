from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.api_schemas import HealthCheckResponse

router = APIRouter()

@router.get("/", response_model=HealthCheckResponse)
async def root():
    return HealthCheckResponse(
        status="healthy",
        message="CV Analysis Service is running",
        version="1.0.0"
    )

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "service": "cv-analysis",
            "version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database connection failed")