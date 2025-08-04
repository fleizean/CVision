# ================================
# scripts/test_connection.py
# ================================
#!/usr/bin/env python3

"""Test database connection and basic functionality"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal
from app.models import CVFileModel, CVAnalysisResultModel
from sqlalchemy import text
import uuid

def test_database_connection():
    """Test basic database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_models():
    """Test database models"""
    try:
        db = SessionLocal()
        
        # Test querying existing tables
        cv_count = db.query(CVFileModel).count()
        analysis_count = db.query(CVAnalysisResultModel).count()
        
        print(f"✅ Models working - CV Files: {cv_count}, Analysis Results: {analysis_count}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Models test failed: {e}")
        return False

def test_cv_analyzer():
    """Test CV analyzer functionality"""
    try:
        from app.services.cv_analyzer import CVAnalyzer
        
        analyzer = CVAnalyzer()
        
        # Test text cleaning
        test_text = "  This is a test   text with    extra spaces  "
        cleaned = analyzer._clean_text(test_text)
        
        print(f"✅ CV Analyzer working - Text cleaned: '{cleaned}'")
        return True
        
    except Exception as e:
        print(f"❌ CV Analyzer test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Running CV Analysis Service Tests...\n")
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Database Models", test_models),
        ("CV Analyzer", test_cv_analyzer)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print(f"Tests completed: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Service is ready to run.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        sys.exit(1)

if __name__ == "__main__":
    main()