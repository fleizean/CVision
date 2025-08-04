# app/services/job_matcher.py
import re
import json
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from loguru import logger
from datetime import datetime

# NLP and similarity
import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import fuzz, process
import pandas as pd
from collections import defaultdict, Counter

# Models
from app.models import CVAnalysisResultModel, KeywordMatchModel, JobProfileModel
from app.core.constants import COMMON_SKILLS

class JobMatcher:
    """Advanced Job Matching Service"""
    
    def __init__(self):
        self.nlp = None
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english', 
            max_features=5000,
            ngram_range=(1, 2),  # Include bigrams for better matching
            lowercase=True
        )
        self._load_nlp_model()
        
        # Skill categories for weighted scoring
        self.skill_categories = {
            'programming_languages': {
                'weight': 1.2,
                'skills': ['python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'dart']
            },
            'frameworks': {
                'weight': 1.1,
                'skills': ['react', 'angular', 'vue', 'next.js', 'nuxt.js', 'django', 'fastapi', 'flask', 'spring', 'laravel', '.net', 'asp.net', 'express']
            },
            'databases': {
                'weight': 1.0,
                'skills': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sql server', 'sqlite', 'oracle']
            },
            'tools_technologies': {
                'weight': 0.9,
                'skills': ['docker', 'kubernetes', 'git', 'jenkins', 'nginx', 'apache', 'rabbitmq', 'kafka']
            },
            'cloud_platforms': {
                'weight': 1.1,
                'skills': ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'digitalocean']
            },
            'soft_skills': {
                'weight': 0.7,
                'skills': ['teamwork', 'leadership', 'communication', 'problem solving', 'analytical thinking', 'creativity']
            }
        }
    
    def _load_nlp_model(self):
        """Load spaCy NLP model for semantic analysis"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model for job matching")
        except OSError:
            logger.warning("spaCy model not available. Using simpler matching methods.")
            self.nlp = None
    
    async def match_cv_with_job(self, cv_analysis_id: str, job_profile_id: str, db: Session) -> Dict[str, Any]:
        """Match a single CV with a specific job profile"""
        try:
            # Get CV analysis result
            cv_analysis = db.query(CVAnalysisResultModel).filter(
                CVAnalysisResultModel.Id == cv_analysis_id
            ).first()
            
            if not cv_analysis:
                raise ValueError(f"CV analysis not found: {cv_analysis_id}")
            
            # Get job profile
            job_profile = db.query(JobProfileModel).filter(
                JobProfileModel.Id == job_profile_id
            ).first()
            
            if not job_profile:
                raise ValueError(f"Job profile not found: {job_profile_id}")
            
            # Get CV keywords
            cv_keywords = db.query(KeywordMatchModel).filter(
                KeywordMatchModel.CVAnalysisResultId == cv_analysis_id
            ).all()
            
            cv_skills = [kw.Keyword.lower() for kw in cv_keywords if kw.IsMatched]
            job_skills = [skill.lower() for skill in job_profile.SuggestedKeywords]
            
            # Perform advanced matching
            match_result = self._calculate_advanced_match(cv_skills, job_skills, cv_analysis, job_profile)
            
            return {
                'cv_id': str(cv_analysis.CVFileId),
                'job_profile_id': str(job_profile.Id),
                'cv_title': cv_analysis.cv_file.FileName if cv_analysis.cv_file else 'Unknown',
                'job_title': job_profile.Title,
                'match_percentage': match_result['match_percentage'],
                'total_job_keywords': len(job_skills),
                'matched_keywords': match_result['matched_keywords'],
                'missing_keywords': match_result['missing_keywords'],
                'extra_keywords': match_result['extra_keywords'],
                'semantic_similarity': match_result['semantic_similarity'],
                'weighted_score': match_result['weighted_score'],
                'category_scores': match_result['category_scores'],
                'recommendations': match_result['recommendations']
            }
            
        except Exception as e:
            logger.error(f"Error matching CV with job: {e}")
            raise
    
    async def match_cv_with_all_jobs(self, cv_analysis_id: str, db: Session) -> Dict[str, Any]:
        """Match a CV with all available job profiles"""
        try:
            # Get CV analysis result
            cv_analysis = db.query(CVAnalysisResultModel).filter(
                CVAnalysisResultModel.Id == cv_analysis_id
            ).first()
            
            if not cv_analysis:
                raise ValueError(f"CV analysis not found: {cv_analysis_id}")
            
            # Get all job profiles
            job_profiles = db.query(JobProfileModel).filter(
                JobProfileModel.IsDeleted == False
            ).all()
            
            if not job_profiles:
                return {
                    'cv_id': str(cv_analysis.CVFileId),
                    'cv_title': cv_analysis.cv_file.FileName if cv_analysis.cv_file else 'Unknown',
                    'total_job_profiles': 0,
                    'matches': [],
                    'best_match': None,
                    'average_match_percentage': 0
                }
            
            # Get CV keywords
            cv_keywords = db.query(KeywordMatchModel).filter(
                KeywordMatchModel.CVAnalysisResultId == cv_analysis_id
            ).all()
            
            cv_skills = [kw.Keyword.lower() for kw in cv_keywords if kw.IsMatched]
            
            # Match with each job profile
            matches = []
            total_score = 0
            
            for job_profile in job_profiles:
                job_skills = [skill.lower() for skill in job_profile.SuggestedKeywords]
                match_result = self._calculate_advanced_match(cv_skills, job_skills, cv_analysis, job_profile)
                
                match_data = {
                    'job_profile_id': str(job_profile.Id),
                    'job_title': job_profile.Title,
                    'match_percentage': match_result['match_percentage'],
                    'total_job_keywords': len(job_skills),
                    'matched_keywords_count': len(match_result['matched_keywords']),
                    'matched_keywords': match_result['matched_keywords'],
                    'missing_keywords': match_result['missing_keywords'],
                    'semantic_similarity': match_result['semantic_similarity'],
                    'weighted_score': match_result['weighted_score'],
                    'category_scores': match_result['category_scores']
                }
                
                matches.append(match_data)
                total_score += match_result['match_percentage']
            
            # Sort by match percentage
            matches.sort(key=lambda x: x['match_percentage'], reverse=True)
            
            # Calculate average
            average_match = total_score / len(job_profiles) if job_profiles else 0
            
            return {
                'cv_id': str(cv_analysis.CVFileId),
                'cv_title': cv_analysis.cv_file.FileName if cv_analysis.cv_file else 'Unknown',
                'total_job_profiles': len(job_profiles),
                'matches': matches,
                'best_match': matches[0] if matches else None,
                'average_match_percentage': round(average_match, 2)
            }
            
        except Exception as e:
            logger.error(f"Error matching CV with all jobs: {e}")
            raise
    
    async def get_top_matches_for_job(self, job_profile_id: str, limit: int, db: Session) -> Dict[str, Any]:
        """Get top CV matches for a specific job profile"""
        try:
            # Get job profile
            job_profile = db.query(JobProfileModel).filter(
                JobProfileModel.Id == job_profile_id
            ).first()
            
            if not job_profile:
                raise ValueError(f"Job profile not found: {job_profile_id}")
            
            # Get all CV analysis results
            cv_analyses = db.query(CVAnalysisResultModel).filter(
                CVAnalysisResultModel.IsDeleted == False
            ).all()
            
            if not cv_analyses:
                return {
                    'job_profile_id': str(job_profile.Id),
                    'job_title': job_profile.Title,
                    'total_cvs_analyzed': 0,
                    'top_matches': [],
                    'average_match_percentage': 0
                }
            
            job_skills = [skill.lower() for skill in job_profile.SuggestedKeywords]
            matches = []
            total_score = 0
            
            for cv_analysis in cv_analyses:
                # Get CV keywords
                cv_keywords = db.query(KeywordMatchModel).filter(
                    KeywordMatchModel.CVAnalysisResultId == cv_analysis.Id
                ).all()
                
                cv_skills = [kw.Keyword.lower() for kw in cv_keywords if kw.IsMatched]
                match_result = self._calculate_advanced_match(cv_skills, job_skills, cv_analysis, job_profile)
                
                match_data = {
                    'cv_id': str(cv_analysis.CVFileId),
                    'cv_file_name': cv_analysis.cv_file.FileName if cv_analysis.cv_file else 'Unknown',
                    'match_percentage': match_result['match_percentage'],
                    'total_job_keywords': len(job_skills),
                    'matched_keywords_count': len(match_result['matched_keywords']),
                    'matched_keywords': match_result['matched_keywords'],
                    'analysis_date': cv_analysis.CreatedAt,
                    'semantic_similarity': match_result['semantic_similarity'],
                    'weighted_score': match_result['weighted_score'],
                    'cv_score': cv_analysis.Score
                }
                
                matches.append(match_data)
                total_score += match_result['match_percentage']
            
            # Sort by match percentage and limit results
            matches.sort(key=lambda x: x['match_percentage'], reverse=True)
            top_matches = matches[:limit]
            
            # Calculate average
            average_match = total_score / len(cv_analyses) if cv_analyses else 0
            
            return {
                'job_profile_id': str(job_profile.Id),
                'job_title': job_profile.Title,
                'total_cvs_analyzed': len(cv_analyses),
                'top_matches': top_matches,
                'average_match_percentage': round(average_match, 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting top matches for job: {e}")
            raise
    
    def _calculate_advanced_match(self, cv_skills: List[str], job_skills: List[str], 
                                cv_analysis: CVAnalysisResultModel, job_profile: JobProfileModel) -> Dict[str, Any]:
        """Calculate advanced matching score with multiple algorithms"""
        
        # 1. Exact matching
        exact_matches = self._find_exact_matches(cv_skills, job_skills)
        
        # 2. Fuzzy matching for similar skills
        fuzzy_matches = self._find_fuzzy_matches(cv_skills, job_skills, exact_matches)
        
        # 3. Semantic matching using NLP (if available)
        semantic_similarity = self._calculate_semantic_similarity(cv_skills, job_skills)
        
        # 4. Category-based weighted scoring
        category_scores = self._calculate_category_scores(cv_skills, job_skills)
        
        # 5. Combine all matches
        all_matched = list(set(exact_matches + fuzzy_matches))
        missing_keywords = [skill for skill in job_skills if skill not in all_matched]
        extra_keywords = [skill for skill in cv_skills if skill not in job_skills]
        
        # 6. Calculate weighted final score
        weighted_score = self._calculate_weighted_score(
            exact_matches, fuzzy_matches, semantic_similarity, category_scores, job_skills
        )
        
        # 7. Calculate basic percentage
        basic_percentage = (len(all_matched) / len(job_skills) * 100) if job_skills else 0
        
        # 8. Combine basic and weighted scores
        final_percentage = (basic_percentage * 0.6 + weighted_score * 0.4)
        final_percentage = min(final_percentage, 100)
        
        # 9. Generate recommendations
        recommendations = self._generate_recommendations(missing_keywords, category_scores, cv_analysis)
        
        return {
            'match_percentage': round(final_percentage, 2),
            'matched_keywords': all_matched,
            'missing_keywords': missing_keywords,
            'extra_keywords': extra_keywords[:10],  # Limit to 10 for brevity
            'semantic_similarity': round(semantic_similarity, 3),
            'weighted_score': round(weighted_score, 2),
            'category_scores': category_scores,
            'recommendations': recommendations
        }
    
    def _find_exact_matches(self, cv_skills: List[str], job_skills: List[str]) -> List[str]:
        """Find exact skill matches"""
        cv_skills_set = set(cv_skills)
        return [skill for skill in job_skills if skill in cv_skills_set]
    
    def _find_fuzzy_matches(self, cv_skills: List[str], job_skills: List[str], exact_matches: List[str]) -> List[str]:
        """Find fuzzy matches for skills not exactly matched"""
        fuzzy_matches = []
        unmatched_job_skills = [skill for skill in job_skills if skill not in exact_matches]
        
        for job_skill in unmatched_job_skills:
            # Use fuzzy string matching
            best_match = process.extractOne(job_skill, cv_skills, score_cutoff=80)
            if best_match:
                fuzzy_matches.append(job_skill)
                
            # Check for partial matches (e.g., "react.js" vs "react")
            for cv_skill in cv_skills:
                if (job_skill in cv_skill or cv_skill in job_skill) and len(job_skill) > 2:
                    if job_skill not in fuzzy_matches:
                        fuzzy_matches.append(job_skill)
                    break
        
        return fuzzy_matches
    
    def _calculate_semantic_similarity(self, cv_skills: List[str], job_skills: List[str]) -> float:
        """Calculate semantic similarity using NLP"""
        if not self.nlp or not cv_skills or not job_skills:
            return 0.0
        
        try:
            # Create skill vectors
            cv_text = " ".join(cv_skills)
            job_text = " ".join(job_skills)
            
            cv_doc = self.nlp(cv_text)
            job_doc = self.nlp(job_text)
            
            # Calculate similarity
            return cv_doc.similarity(job_doc)
            
        except Exception as e:
            logger.warning(f"Error calculating semantic similarity: {e}")
            return 0.0
    
    def _calculate_category_scores(self, cv_skills: List[str], job_skills: List[str]) -> Dict[str, Dict[str, Any]]:
        """Calculate scores by skill category with weights"""
        category_scores = {}
        
        for category, config in self.skill_categories.items():
            category_job_skills = [skill for skill in job_skills if skill in config['skills']]
            category_cv_skills = [skill for skill in cv_skills if skill in config['skills']]
            
            if category_job_skills:
                matched_skills = [skill for skill in category_job_skills if skill in category_cv_skills]
                match_rate = len(matched_skills) / len(category_job_skills)
                weighted_score = match_rate * config['weight'] * 100
                
                category_scores[category] = {
                    'required_skills': category_job_skills,
                    'matched_skills': matched_skills,
                    'match_rate': round(match_rate, 3),
                    'weighted_score': round(weighted_score, 2),
                    'weight': config['weight']
                }
        
        return category_scores
    
    def _calculate_weighted_score(self, exact_matches: List[str], fuzzy_matches: List[str], 
                                semantic_similarity: float, category_scores: Dict, job_skills: List[str]) -> float:
        """Calculate final weighted score"""
        if not job_skills:
            return 0.0
        
        # Base scores
        exact_score = len(exact_matches) / len(job_skills) * 100
        fuzzy_score = len(fuzzy_matches) / len(job_skills) * 50  # Fuzzy matches get less weight
        semantic_score = semantic_similarity * 30  # Semantic bonus
        
        # Category-based weighted score
        category_weighted_score = 0
        total_weight = 0
        
        for category_data in category_scores.values():
            category_weighted_score += category_data['weighted_score']
            total_weight += category_data['weight'] * 100
        
        if total_weight > 0:
            category_weighted_score = category_weighted_score / total_weight * 100
        
        # Combine all scores
        final_score = (
            exact_score * 0.4 +           # 40% for exact matches
            fuzzy_score * 0.2 +           # 20% for fuzzy matches
            semantic_score * 0.2 +        # 20% for semantic similarity
            category_weighted_score * 0.2  # 20% for category weights
        )
        
        return min(final_score, 100)
    
    def _generate_recommendations(self, missing_keywords: List[str], category_scores: Dict, 
                                cv_analysis: CVAnalysisResultModel) -> List[str]:
        """Generate improvement recommendations based on missing skills"""
        recommendations = []
        
        # Skills-based recommendations
        if missing_keywords:
            high_priority_missing = []
            for category, config in self.skill_categories.items():
                if config['weight'] > 1.0:  # High priority categories
                    missing_in_category = [skill for skill in missing_keywords if skill in config['skills']]
                    high_priority_missing.extend(missing_in_category)
            
            if high_priority_missing:
                recommendations.append(f"Focus on developing these high-priority skills: {', '.join(high_priority_missing[:5])}")
            
            if len(missing_keywords) > 5:
                recommendations.append(f"Consider learning {len(missing_keywords)} additional skills to improve match rate")
        
        # Category-specific recommendations
        for category, data in category_scores.items():
            if data['match_rate'] < 0.5 and len(data['required_skills']) > 2:
                recommendations.append(f"Strengthen your {category.replace('_', ' ')} skills")
        
        # CV quality recommendations
        if cv_analysis.Score < 70:
            recommendations.append("Improve your CV overall score by enhancing format and content quality")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def analyze_skill_gaps(self, cv_skills: List[str], market_demand_data: Dict[str, int] = None) -> Dict[str, Any]:
        """Analyze skill gaps based on market demand (future enhancement)"""
        # This can be enhanced with real market data
        skill_gaps = {
            'trending_skills': ['docker', 'kubernetes', 'react', 'python', 'aws'],
            'missing_from_cv': [],
            'recommendations': []
        }
        
        if market_demand_data:
            # Compare CV skills with market demand
            for skill, demand in market_demand_data.items():
                if skill not in cv_skills and demand > 100:  # High demand threshold
                    skill_gaps['missing_from_cv'].append(skill)
        
        return skill_gaps