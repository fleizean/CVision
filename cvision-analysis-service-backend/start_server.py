#!/usr/bin/env python3
"""
Start the FastAPI server
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting CVision Analysis Service...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Alternative docs: http://localhost:8000/redoc")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )