#!/usr/bin/env python3
"""
Test the FastAPI endpoints
"""
import asyncio
import httpx
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from fastapi.testclient import TestClient

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🏥 Testing Health Check Endpoint...")
    
    client = TestClient(app)
    response = client.get("/health")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Health check passed!")
    else:
        print("❌ Health check failed!")
    
    return response.status_code == 200

def test_stats_endpoint():
    """Test the stats endpoint"""
    print("\n📊 Testing Stats Endpoint...")
    
    client = TestClient(app)
    response = client.get("/api/statistics")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Stats endpoint working!")
    else:
        print("❌ Stats endpoint failed!")
    
    return response.status_code == 200

def test_job_matching_endpoint():
    """Test the job matching endpoint"""
    print("\n🎯 Testing Job Matching Endpoint...")
    
    client = TestClient(app)
    
    # Test data
    test_data = {
        "cv_keywords": ["python", "react", "javascript", "docker", "aws"],
        "job_keywords": ["python", "django", "postgresql", "docker", "kubernetes"]
    }
    
    response = client.post("/api/job-matching/match", json=test_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Match Percentage: {result.get('match_percentage', 'N/A')}%")
        print(f"Matched Keywords: {result.get('matched_keywords', [])}")
        print("✅ Job matching endpoint working!")
    else:
        print("❌ Job matching endpoint failed!")
    
    return response.status_code == 200

if __name__ == "__main__":
    print("🧪 Testing FastAPI Endpoints")
    print("=" * 40)
    
    success_count = 0
    total_tests = 3
    
    # Test endpoints
    if test_health_endpoint():
        success_count += 1
    
    if test_stats_endpoint():
        success_count += 1
    
    if test_job_matching_endpoint():
        success_count += 1
    
    # Summary
    print(f"\n🏆 Test Results: {success_count}/{total_tests} passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed successfully!")
    else:
        print("⚠️ Some tests failed. Check the logs above.")
    
    print("\n💡 To start the full server, run: python start_server.py")