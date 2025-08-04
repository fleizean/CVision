from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.database_models import CVFileModel
from app.services.cv_analyzer import CVAnalyzer
from app.schemas.api_schemas import CVFileResponse, AnalyzeResponse

router = APIRouter()
cv_analyzer = CVAnalyzer()

@router.post("/analyze-pending")
async def trigger_pending_analysis(background_tasks: BackgroundTasks):
    from app.services.pending_processor import PendingCVProcessor
    processor = PendingCVProcessor()
    background_tasks.add_task(processor.process_batch)
    return {"message": "Pending CV analysis triggered", "status": "processing"}

@router.post("/analyze/{cv_file_id}")
async def analyze_single_cv(
    cv_file_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    cv_file = db.query(CVFileModel).filter(
        CVFileModel.Id == cv_file_id,
        CVFileModel.IsDeleted == False
    ).first()
    
    if not cv_file:
        raise HTTPException(status_code=404, detail="CV file not found")
    
    background_tasks.add_task(cv_analyzer.analyze_cv, cv_file, db)
    return {"message": f"Analysis started for {cv_file.FileName}", "status": "processing"}

@router.get("/pending-cvs", response_model=List[CVFileResponse])
async def get_pending_cvs(limit: int = 10, db: Session = Depends(get_db)):
    pending_cvs = db.query(CVFileModel).filter(
        CVFileModel.AnalysisStatus == "Pending",
        CVFileModel.IsDeleted == False
    ).limit(limit).all()
    
    return [
        CVFileResponse(
            id=str(cv.Id),
            fileName=cv.FileName,
            filePath=cv.FilePath,
            fileType=cv.FileType,
            analysisStatus=cv.AnalysisStatus,
            uploadedAt=cv.UploadedAt,
            userId=str(cv.UserId)
        )
        for cv in pending_cvs
    ]