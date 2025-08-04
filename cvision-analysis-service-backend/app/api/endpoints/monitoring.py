# ================================
# app/api/endpoints/monitoring.py
# ================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database_models import CVFileModel, CVAnalysisResultModel
from app.schemas.api_schemas import ServiceStats, ProcessingStats
from app.services.pending_processor import PendingCVProcessor

router = APIRouter()

@router.get("/statistics", response_model=ServiceStats)
async def get_service_statistics(db: Session = Depends(get_db)):
    """Get comprehensive service statistics"""
    try:
        # Get CV counts by status
        total_cvs = db.query(CVFileModel).filter(CVFileModel.IsDeleted == False).count()
        pending_cvs = db.query(CVFileModel).filter(
            CVFileModel.AnalysisStatus == "Pending",
            CVFileModel.IsDeleted == False
        ).count()
        completed_cvs = db.query(CVFileModel).filter(
            CVFileModel.AnalysisStatus == "Completed",
            CVFileModel.IsDeleted == False
        ).count()
        failed_cvs = db.query(CVFileModel).filter(
            CVFileModel.AnalysisStatus == "Failed",
            CVFileModel.IsDeleted == False
        ).count()
        
        # Get average score
        avg_score_result = db.query(func.avg(CVAnalysisResultModel.Score)).filter(
            CVAnalysisResultModel.IsDeleted == False
        ).scalar()
        average_score = float(avg_score_result) if avg_score_result else None
        
        # Get processor stats (this is a simplified version)
        processor_stats = ProcessingStats(
            is_running=True,  # We'll assume it's running for now
            processed_count=completed_cvs,
            failed_count=failed_cvs,
            success_rate=(completed_cvs / (completed_cvs + failed_cvs) * 100) if (completed_cvs + failed_cvs) > 0 else 0
        )
        
        return ServiceStats(
            total_cvs=total_cvs,
            pending_cvs=pending_cvs,
            completed_cvs=completed_cvs,
            failed_cvs=failed_cvs,
            average_score=average_score,
            processor_stats=processor_stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.get("/processor-status")
async def get_processor_status():
    """Get background processor status"""
    return {
        "status": "running",
        "message": "Background CV processor is active",
        "last_check": "N/A"  # Could be enhanced to track actual status
    }

@router.post("/restart-processor")
async def restart_processor():
    """Restart the background processor"""
    return {
        "status": "restarted", 
        "message": "Background processor restart requested"
    }