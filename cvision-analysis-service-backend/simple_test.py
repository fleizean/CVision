#!/usr/bin/env python3
"""
Simple test for job matching logic without dependencies
"""

def test_exact_matching():
    """Test exact skill matching"""
    cv_skills = ['python', 'react', 'javascript', 'docker', 'aws', 'django', 'postgresql']
    job_skills = ['python', 'django', 'postgresql', 'redis', 'docker', 'kubernetes']
    
    # Find exact matches
    cv_skills_set = set(cv_skills)
    exact_matches = [skill for skill in job_skills if skill in cv_skills_set]
    
    print(f"CV Skills: {cv_skills}")
    print(f"Job Skills: {job_skills}")
    print(f"Exact Matches: {exact_matches}")
    print(f"Match Percentage: {len(exact_matches) / len(job_skills) * 100:.1f}%")
    
    return exact_matches

def test_category_scoring():
    """Test skill category scoring"""
    skill_categories = {
        'programming_languages': {
            'weight': 1.2,
            'skills': ['python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'php', 'ruby', 'go']
        },
        'frameworks': {
            'weight': 1.1,
            'skills': ['react', 'angular', 'vue', 'django', 'fastapi', 'flask', 'spring', '.net', 'express']
        },
        'databases': {
            'weight': 1.0,
            'skills': ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite']
        },
        'cloud_platforms': {
            'weight': 1.1,
            'skills': ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'docker', 'kubernetes']
        }
    }
    
    cv_skills = ['python', 'react', 'javascript', 'docker', 'aws', 'django', 'postgresql']
    job_skills = ['python', 'django', 'postgresql', 'redis', 'docker', 'kubernetes']
    
    print(f"\n📊 Category Analysis:")
    total_weighted_score = 0
    
    for category, config in skill_categories.items():
        category_job_skills = [skill for skill in job_skills if skill in config['skills']]
        category_cv_skills = [skill for skill in cv_skills if skill in config['skills']]
        
        if category_job_skills:
            matched_skills = [skill for skill in category_job_skills if skill in category_cv_skills]
            match_rate = len(matched_skills) / len(category_job_skills)
            weighted_score = match_rate * config['weight'] * 100
            total_weighted_score += weighted_score
            
            print(f"  {category}:")
            print(f"    Required: {category_job_skills}")
            print(f"    Matched: {matched_skills}")
            print(f"    Rate: {match_rate:.2f} | Weighted: {weighted_score:.1f}")
    
    print(f"\nTotal Weighted Score: {total_weighted_score:.1f}")
    return total_weighted_score

def test_fuzzy_matching():
    """Test fuzzy matching logic"""
    cv_skills = ['reactjs', 'python3', 'postgresql', 'node.js', 'express.js']
    job_skills = ['react', 'python', 'postgres', 'nodejs', 'express']
    
    print(f"\n🔍 Fuzzy Matching Test:")
    print(f"CV Skills: {cv_skills}")
    print(f"Job Skills: {job_skills}")
    
    fuzzy_matches = []
    
    for job_skill in job_skills:
        for cv_skill in cv_skills:
            # Simple fuzzy matching logic
            if (job_skill.lower() in cv_skill.lower() or 
                cv_skill.lower() in job_skill.lower()) and len(job_skill) > 2:
                fuzzy_matches.append(job_skill)
                break
    
    print(f"Fuzzy Matches: {fuzzy_matches}")
    return fuzzy_matches

def generate_recommendations():
    """Generate improvement recommendations"""
    cv_skills = ['python', 'react', 'javascript']
    job_skills = ['python', 'django', 'postgresql', 'redis', 'docker', 'kubernetes']
    
    missing_skills = [skill for skill in job_skills if skill not in cv_skills]
    
    recommendations = []
    
    if missing_skills:
        high_priority = ['docker', 'kubernetes', 'postgresql']  # Mock high priority
        missing_priority = [skill for skill in missing_skills if skill in high_priority]
        
        if missing_priority:
            recommendations.append(f"Focus on these high-priority skills: {', '.join(missing_priority)}")
        
        if len(missing_skills) > 3:
            recommendations.append(f"Consider learning {len(missing_skills)} additional skills")
    
    print(f"\n💡 Recommendations:")
    for rec in recommendations:
        print(f"  • {rec}")
    
    return recommendations

if __name__ == "__main__":
    print("🔬 Simple Job Matching Algorithm Test")
    print("=" * 50)
    
    # Test 1: Exact matching
    print("\n1️⃣ Testing Exact Matching:")
    exact_matches = test_exact_matching()
    
    # Test 2: Category scoring
    print("\n2️⃣ Testing Category Scoring:")
    weighted_score = test_category_scoring()
    
    # Test 3: Fuzzy matching
    print("\n3️⃣ Testing Fuzzy Matching:")
    fuzzy_matches = test_fuzzy_matching()
    
    # Test 4: Recommendations
    print("\n4️⃣ Testing Recommendations:")
    recommendations = generate_recommendations()
    
    # Final score calculation
    basic_percentage = len(exact_matches) / 6 * 100  # 6 job skills
    final_score = (basic_percentage * 0.6 + (weighted_score / 4) * 0.4)  # 4 categories
    
    print(f"\n🏆 Final Results:")
    print(f"  Basic Match: {basic_percentage:.1f}%")
    print(f"  Weighted Score: {weighted_score / 4:.1f}%")
    print(f"  Final Score: {final_score:.1f}%")
    
    print(f"\n✅ Test completed successfully!")
    print(f"🎯 Algorithm demonstrates: Exact matching, fuzzy matching, category weighting, and recommendations")