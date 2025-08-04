"""
FastAPI main application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Import API routers
from app.api.endpoints import health, analysis, job_matching, monitoring

# Create FastAPI app
app = FastAPI(
    title="CVision Analysis Service",
    description="Advanced CV analysis and job matching service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(job_matching.router, prefix="/api/job-matching", tags=["Job Matching"])
app.include_router(monitoring.router, prefix="/api", tags=["Monitoring"])

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("🚀 CVision Analysis Service starting up...")
    logger.info("📍 API Documentation available at: /docs")
    logger.info("🔍 Alternative docs available at: /redoc")

@app.on_event("shutdown") 
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("👋 CVision Analysis Service shutting down...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CVision Analysis Service",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }