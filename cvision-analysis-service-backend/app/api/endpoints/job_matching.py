# app/api/endpoints/job_matching.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from loguru import logger

from app.database import get_db
from app.services.job_matcher import JobMatcher
from app.schemas.api_schemas import (
    JobMatchResponse, 
    CVAllJobsMatchResponse, 
    TopCVMatchesResponse,
    APIResponse
)

router = APIRouter()
job_matcher = JobMatcher()

@router.post("/match/{cv_analysis_id}/with-job/{job_profile_id}")
async def match_cv_with_job(
    cv_analysis_id: str,
    job_profile_id: str,
    db: Session = Depends(get_db)
) -> APIResponse[JobMatchResponse]:
    """
    Match a specific CV with a specific job profile
    """
    try:
        logger.info(f"Matching CV {cv_analysis_id} with job {job_profile_id}")
        
        result = await job_matcher.match_cv_with_job(cv_analysis_id, job_profile_id, db)
        
        response_data = JobMatchResponse(
            cv_id=result['cv_id'],
            job_profile_id=result['job_profile_id'],
            cv_title=result['cv_title'],
            job_title=result['job_title'],
            match_percentage=result['match_percentage'],
            total_job_keywords=result['total_job_keywords'],
            matched_keywords=result['matched_keywords'],
            missing_keywords=result['missing_keywords'],
            extra_keywords=result['extra_keywords'],
            semantic_similarity=result.get('semantic_similarity', 0.0),
            weighted_score=result.get('weighted_score', 0.0),
            category_scores=result.get('category_scores', {}),
            recommendations=result.get('recommendations', [])
        )
        
        return APIResponse(
            status_code=200,
            message="CV-Job matching completed successfully",
            data=response_data
        )
        
    except ValueError as e:
        logger.error(f"Validation error in CV-Job matching: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in CV-Job matching: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during matching")

@router.post("/match/{cv_analysis_id}/with-all-jobs")
async def match_cv_with_all_jobs(
    cv_analysis_id: str,
    db: Session = Depends(get_db)
) -> APIResponse[CVAllJobsMatchResponse]:
    """
    Match a CV with all available job profiles
    """
    try:
        logger.info(f"Matching CV {cv_analysis_id} with all job profiles")
        
        result = await job_matcher.match_cv_with_all_jobs(cv_analysis_id, db)
        
        response_data = CVAllJobsMatchResponse(
            cv_id=result['cv_id'],
            cv_title=result['cv_title'],
            total_job_profiles=result['total_job_profiles'],
            matches=result['matches'],
            best_match=result['best_match'],
            average_match_percentage=result['average_match_percentage']
        )
        
        return APIResponse(
            status_code=200,
            message="CV matched with all job profiles successfully",
            data=response_data
        )
        
    except ValueError as e:
        logger.error(f"Validation error in CV-All Jobs matching: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in CV-All Jobs matching: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during matching")

@router.get("/top-matches/{job_profile_id}")
async def get_top_matches_for_job(
    job_profile_id: str,
    limit: int = Query(default=10, ge=1, le=50, description="Number of top matches to return"),
    db: Session = Depends(get_db)
) -> APIResponse[TopCVMatchesResponse]:
    """
    Get top CV matches for a specific job profile
    """
    try:
        logger.info(f"Getting top {limit} matches for job profile {job_profile_id}")
        
        result = await job_matcher.get_top_matches_for_job(job_profile_id, limit, db)
        
        response_data = TopCVMatchesResponse(
            job_profile_id=result['job_profile_id'],
            job_title=result['job_title'],
            total_cvs_analyzed=result['total_cvs_analyzed'],
            top_matches=result['top_matches'],
            average_match_percentage=result['average_match_percentage']
        )
        
        return APIResponse(
            status_code=200,
            message=f"Top {limit} matches retrieved successfully",
            data=response_data
        )
        
    except ValueError as e:
        logger.error(f"Validation error in getting top matches: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting top matches: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during match retrieval")

@router.post("/analyze-skill-gaps/{cv_analysis_id}")
async def analyze_skill_gaps(
    cv_analysis_id: str,
    db: Session = Depends(get_db)
) -> APIResponse[Dict[str, Any]]:
    """
    Analyze skill gaps for a CV (future enhancement)
    """
    try:
        logger.info(f"Analyzing skill gaps for CV {cv_analysis_id}")
        
        # Get CV keywords
        from app.models import KeywordMatchModel
        cv_keywords = db.query(KeywordMatchModel).filter(
            KeywordMatchModel.CVAnalysisResultId == cv_analysis_id
        ).all()
        
        cv_skills = [kw.Keyword.lower() for kw in cv_keywords if kw.IsMatched]
        
        # Analyze skill gaps (can be enhanced with real market data)
        skill_gaps = job_matcher.analyze_skill_gaps(cv_skills)
        
        return APIResponse(
            status_code=200,
            message="Skill gap analysis completed",
            data=skill_gaps
        )
        
    except Exception as e:
        logger.error(f"Error in skill gap analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during skill gap analysis")

@router.post("/match")
async def simple_skill_match(request_data: Dict[str, List[str]]):
    """
    Simple skill matching endpoint for testing
    """
    try:
        cv_keywords = request_data.get("cv_keywords", [])
        job_keywords = request_data.get("job_keywords", [])
        
        if not cv_keywords or not job_keywords:
            raise HTTPException(status_code=400, detail="Both cv_keywords and job_keywords are required")
        
        # Use the job matcher to perform matching
        exact_matches = job_matcher._find_exact_matches(cv_keywords, job_keywords)
        fuzzy_matches = job_matcher._find_fuzzy_matches(cv_keywords, job_keywords, exact_matches)
        
        # Calculate basic percentage
        total_matches = len(set(exact_matches + fuzzy_matches))
        match_percentage = (total_matches / len(job_keywords)) * 100 if job_keywords else 0
        
        missing_keywords = [skill for skill in job_keywords if skill not in exact_matches and skill not in fuzzy_matches]
        
        return {
            "match_percentage": round(match_percentage, 2),
            "total_job_keywords": len(job_keywords),
            "matched_keywords": exact_matches + fuzzy_matches,
            "missing_keywords": missing_keywords,
            "exact_matches": exact_matches,
            "fuzzy_matches": fuzzy_matches
        }
        
    except Exception as e:
        logger.error(f"Error in simple skill matching: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/matching-statistics")
async def get_matching_statistics(
    db: Session = Depends(get_db)
) -> APIResponse[Dict[str, Any]]:
    """
    Get overall matching statistics
    """
    try:
        from app.models import CVAnalysisResultModel, JobProfileModel
        
        # Get basic statistics
        total_cvs = db.query(CVAnalysisResultModel).filter(
            CVAnalysisResultModel.IsDeleted == False
        ).count()
        
        total_jobs = db.query(JobProfileModel).filter(
            JobProfileModel.IsDeleted == False
        ).count()
        
        # Calculate some basic statistics
        stats = {
            'total_cvs_analyzed': total_cvs,
            'total_job_profiles': total_jobs,
            'possible_matches': total_cvs * total_jobs,
            'system_status': 'active'
        }
        
        return APIResponse(
            status_code=200,
            message="Matching statistics retrieved successfully",
            data=stats
        )
        
    except Exception as e:
        logger.error(f"Error getting matching statistics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")