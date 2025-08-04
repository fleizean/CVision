#!/usr/bin/env python3
"""
Test script for job matching functionality
"""
import asyncio
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.job_matcher import JobMatcher

async def test_job_matcher():
    """Test the job matcher functionality"""
    print("🧪 Testing Job Matcher...")
    
    # Initialize matcher
    matcher = JobMatcher()
    print("✅ JobMatcher initialized successfully")
    
    # Test data
    cv_skills = ['python', 'react', 'javascript', 'docker', 'aws', 'django', 'postgresql']
    job_skills = ['python', 'django', 'postgresql', 'redis', 'docker', 'kubernetes']
    
    print(f"\n📝 CV Skills: {cv_skills}")
    print(f"💼 Job Skills: {job_skills}")
    
    # Test exact matching
    exact_matches = matcher._find_exact_matches(cv_skills, job_skills)
    print(f"\n🎯 Exact Matches: {exact_matches}")
    
    # Test fuzzy matching
    fuzzy_matches = matcher._find_fuzzy_matches(cv_skills, job_skills, exact_matches)
    print(f"🔍 Fuzzy Matches: {fuzzy_matches}")
    
    # Test semantic similarity
    semantic_score = matcher._calculate_semantic_similarity(cv_skills, job_skills)
    print(f"🧠 Semantic Similarity: {semantic_score:.3f}")
    
    # Test category scores
    category_scores = matcher._calculate_category_scores(cv_skills, job_skills)
    print(f"\n📊 Category Scores:")
    for category, data in category_scores.items():
        print(f"  {category}: {data['match_rate']:.2f} ({data['weighted_score']:.1f}%)")
    
    # Test advanced matching (mock CV analysis and job profile)
    class MockCVAnalysis:
        def __init__(self):
            self.Score = 85
            self.cv_file = MockCVFile()
    
    class MockCVFile:
        def __init__(self):
            self.FileName = "test_cv.pdf"
    
    class MockJobProfile:
        def __init__(self):
            self.Title = "Python Developer"
    
    cv_analysis = MockCVAnalysis()
    job_profile = MockJobProfile()
    
    advanced_result = matcher._calculate_advanced_match(
        cv_skills, job_skills, cv_analysis, job_profile
    )
    
    print(f"\n🚀 Advanced Matching Results:")
    print(f"  Match Percentage: {advanced_result['match_percentage']:.2f}%")
    print(f"  Weighted Score: {advanced_result['weighted_score']:.2f}")
    print(f"  Matched Keywords: {advanced_result['matched_keywords']}")
    print(f"  Missing Keywords: {advanced_result['missing_keywords']}")
    print(f"  Recommendations: {advanced_result['recommendations']}")
    
    print("\n✅ All tests completed successfully!")

def test_skill_categories():
    """Test skill categorization"""
    print("\n📂 Testing Skill Categories...")
    
    matcher = JobMatcher()
    
    for category, config in matcher.skill_categories.items():
        print(f"\n{category.replace('_', ' ').title()}:")
        print(f"  Weight: {config['weight']}")
        print(f"  Skills: {config['skills'][:5]}...")  # Show first 5 skills

if __name__ == "__main__":
    print("🔬 Job Matching Algorithm Test Suite")
    print("=" * 50)
    
    # Test skill categories
    test_skill_categories()
    
    # Test matching algorithms
    asyncio.run(test_job_matcher())
    
    print("\n🎉 Test suite completed!")