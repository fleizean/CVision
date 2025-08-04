# app/services/pending_processor.py
import asyncio
from typing import List
from sqlalchemy.orm import Session
from loguru import logger
from datetime import datetime

from app.database import SessionLocal
from app.models import CVFileModel
from app.services.cv_analyzer import CVAnalyzer
from app.core.config import settings
from app.core.constants import CVStatus

class PendingCVProcessor:
    """Background service to process pending CVs"""
    
    def __init__(self):
        self.cv_analyzer = CVAnalyzer()
        self.is_running = False
        self.processed_count = 0
        self.failed_count = 0

    async def start_processing(self):
        """Start the background processing loop"""
        self.is_running = True
        logger.info("Started pending CV processor")
        
        while self.is_running:
            try:
                db = SessionLocal()
                try:
                    await self.process_batch(db)
                finally:
                    db.close()
                
                # Wait before next batch
                await asyncio.sleep(settings.PROCESSING_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
                await asyncio.sleep(settings.PROCESSING_INTERVAL)

    async def process_batch(self, db: Session):
        """Process a batch of pending CVs"""
        try:
            # Get pending CVs
            pending_cvs = self._get_pending_cvs(db)
            
            if not pending_cvs:
                logger.debug("No pending CVs found")
                return
            
            logger.info(f"Processing {len(pending_cvs)} pending CVs")
            
            # Process each CV
            for cv_file in pending_cvs:
                try:
                    success = await self.cv_analyzer.analyze_cv(cv_file, db)
                    if success:
                        self.processed_count += 1
                        logger.info(f"Successfully processed CV: {cv_file.FileName}")
                    else:
                        self.failed_count += 1
                        logger.warning(f"Failed to process CV: {cv_file.FileName}")
                        
                except Exception as e:
                    self.failed_count += 1
                    logger.error(f"Error processing CV {cv_file.FileName}: {e}")
                    
                    # Mark as failed
                    cv_file.AnalysisStatus = CVStatus.FAILED
                    cv_file.UpdatedAt = datetime.utcnow()
                    db.commit()
            
            logger.info(f"Batch processing completed. Processed: {self.processed_count}, Failed: {self.failed_count}")
            
        except Exception as e:
            logger.error(f"Error in batch processing: {e}")

    def _get_pending_cvs(self, db: Session) -> List[CVFileModel]:
        """Get pending CVs from database"""
        try:
            return db.query(CVFileModel).filter(
                CVFileModel.AnalysisStatus == CVStatus.PENDING,
                CVFileModel.IsDeleted == False
            ).limit(settings.BATCH_SIZE).all()
            
        except Exception as e:
            logger.error(f"Error fetching pending CVs: {e}")
            return []

    def stop_processing(self):
        """Stop the background processing"""
        self.is_running = False
        logger.info("Stopped pending CV processor")

    def get_stats(self) -> dict:
        """Get processing statistics"""
        return {
            "is_running": self.is_running,
            "processed_count": self.processed_count,
            "failed_count": self.failed_count,
            "success_rate": (self.processed_count / (self.processed_count + self.failed_count) * 100) 
                           if (self.processed_count + self.failed_count) > 0 else 0
        }

# ================================
# app/services/file_processor.py
# ================================
import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from loguru import logger

from app.core.config import settings

class FileProcessor:
    """Handle file operations for CV uploads"""
    
    def __init__(self):
        self.upload_folder = Path(settings.UPLOAD_FOLDER)
        self.upload_folder.mkdir(exist_ok=True)

    async def save_uploaded_file(self, file: UploadFile, user_id: str) -> Optional[str]:
        """Save uploaded CV file to disk"""
        try:
            # Validate file
            if not self._is_valid_file(file):
                return None
            
            # Create user folder
            user_folder = self.upload_folder / user_id
            user_folder.mkdir(exist_ok=True)
            
            # Generate unique filename
            file_extension = Path(file.filename).suffix
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{file.filename}"
            file_path = user_folder / filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"Saved file: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            return None

    def _is_valid_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        if not file.filename:
            return False
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in settings.ALLOWED_EXTENSIONS:
            logger.warning(f"Invalid file extension: {file_extension}")
            return False
        
        # Check file size (if we can get it)
        if hasattr(file, 'size') and file.size > settings.MAX_FILE_SIZE:
            logger.warning(f"File too large: {file.size} bytes")
            return False
        
        return True

    def delete_file(self, file_path: str) -> bool:
        """Delete a file from disk"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted file: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False

# ================================
# app/services/notification_service.py
# ================================
import httpx
from typing import Dict, Any
from loguru import logger

from app.core.config import settings

class NotificationService:
    """Service to notify .NET API about analysis completion"""
    
    def __init__(self):
        self.dotnet_api_url = settings.DOTNET_API_URL
        self.timeout = 30

    async def notify_analysis_complete(self, cv_file_id: str, analysis_result: Dict[str, Any]) -> bool:
        """Notify .NET API that CV analysis is complete"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "cvFileId": cv_file_id,
                    "analysisCompleted": True,
                    "score": analysis_result.get("score", 0),
                    "status": "Completed"
                }
                
                response = await client.post(
                    f"{self.dotnet_api_url}/cv-analysis/notify-completion",
                    json=payload
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully notified .NET API for CV: {cv_file_id}")
                    return True
                else:
                    logger.warning(f"Failed to notify .NET API. Status: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error notifying .NET API: {e}")
            return False

    async def notify_analysis_failed(self, cv_file_id: str, error_message: str) -> bool:
        """Notify .NET API that CV analysis failed"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "cvFileId": cv_file_id,
                    "analysisCompleted": False,
                    "status": "Failed",
                    "errorMessage": error_message
                }
                
                response = await client.post(
                    f"{self.dotnet_api_url}/cv-analysis/notify-failure",
                    json=payload
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully notified .NET API of failure for CV: {cv_file_id}")
                    return True
                else:
                    logger.warning(f"Failed to notify .NET API of failure. Status: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error notifying .NET API of failure: {e}")
            return False

# ================================
# app/services/job_profile_matcher.py
# ================================
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from loguru import logger

from app.models import JobProfileModel

class JobProfileMatcher:
    """Service to match CVs against job profiles"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )

    def match_cv_to_profiles(self, cv_text: str, job_profiles: List[JobProfileModel]) -> List[Tuple[str, float]]:
        """Match CV against multiple job profiles and return similarity scores"""
        try:
            if not job_profiles:
                return []
            
            # Prepare texts for comparison
            texts = [cv_text]
            profile_texts = []
            
            for profile in job_profiles:
                # Combine title and keywords for matching
                profile_text = f"{profile.Title} {' '.join(profile.SuggestedKeywords)}"
                profile_texts.append(profile_text)
                texts.append(profile_text)
            
            # Calculate TF-IDF similarity
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            cv_vector = tfidf_matrix[0:1]  # First row is CV
            profile_vectors = tfidf_matrix[1:]  # Rest are profiles
            
            # Calculate cosine similarity
            similarities = cosine_similarity(cv_vector, profile_vectors).flatten()
            
            # Create results with profile IDs and scores
            results = []
            for i, profile in enumerate(job_profiles):
                score = float(similarities[i])
                results.append((str(profile.Id), score))
            
            # Sort by similarity score (descending)
            results.sort(key=lambda x: x[1], reverse=True)
            
            return results
            
        except Exception as e:
            logger.error(f"Error matching CV to profiles: {e}")
            return []

    def calculate_keyword_match_score(self, cv_text: str, keywords: List[str]) -> Dict[str, Any]:
        """Calculate detailed keyword matching score"""
        try:
            cv_text_lower = cv_text.lower()
            matched_keywords = []
            total_matches = 0
            
            for keyword in keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in cv_text_lower:
                    # Count occurrences
                    count = cv_text_lower.count(keyword_lower)
                    matched_keywords.append({
                        'keyword': keyword,
                        'count': count,
                        'matched': True
                    })
                    total_matches += count
                else:
                    matched_keywords.append({
                        'keyword': keyword,
                        'count': 0,
                        'matched': False
                    })
            
            # Calculate match percentage
            match_percentage = (len([k for k in matched_keywords if k['matched']]) / len(keywords)) * 100 if keywords else 0
            
            return {
                'matched_keywords': matched_keywords,
                'total_matches': total_matches,
                'match_percentage': match_percentage,
                'keywords_found': len([k for k in matched_keywords if k['matched']]),
                'total_keywords': len(keywords)
            }
            
        except Exception as e:
            logger.error(f"Error calculating keyword match score: {e}")
            return {
                'matched_keywords': [],
                'total_matches': 0,
                'match_percentage': 0,
                'keywords_found': 0,
                'total_keywords': len(keywords) if keywords else 0
            }