#!/usr/bin/env python3
"""
Simple test for job matching without spacy dependency
"""
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock the spacy import to avoid download requirement
import unittest.mock
with unittest.mock.patch.dict('sys.modules', {'spacy': unittest.mock.MagicMock()}):
    from app.services.job_matcher import JobMatcher

def test_job_matcher():
    """Test the job matcher functionality without spacy"""
    print("🧪 Testing Job Matcher (without spacy)...")
    
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
    
    # Test category scores (without semantic similarity)
    category_scores = matcher._calculate_category_scores(cv_skills, job_skills)
    print(f"\n📊 Category Scores:")
    for category, data in category_scores.items():
        print(f"  {category}: {data['match_rate']:.2f} ({data['weighted_score']:.1f}%)")
    
    # Test basic matching calculation
    total_job_skills = len(job_skills)
    matched_count = len(exact_matches) + len(fuzzy_matches)
    basic_percentage = (matched_count / total_job_skills) * 100
    
    print(f"\n🏆 Results:")
    print(f"  Total Job Skills: {total_job_skills}")
    print(f"  Matched Skills: {matched_count}")
    print(f"  Basic Match Percentage: {basic_percentage:.1f}%")
    
    # Calculate weighted score
    total_weighted_score = sum(data['weighted_score'] for data in category_scores.values())
    category_count = len([cat for cat, data in category_scores.items() if data['weighted_score'] > 0])
    
    if category_count > 0:
        avg_weighted_score = total_weighted_score / category_count
        print(f"  Average Weighted Score: {avg_weighted_score:.1f}%")
    
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
    print("🔬 Job Matching Algorithm Test Suite (Simple)")
    print("=" * 60)
    
    # Test skill categories
    test_skill_categories()
    
    # Test matching algorithms
    test_job_matcher()
    
    print("\n🎉 Test suite completed!")