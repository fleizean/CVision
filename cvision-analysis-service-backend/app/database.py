from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from loguru import logger
from app.core.config import settings

# Create database engine
try:
    # Create engine with pymssql driver
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=StaticPool,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG  # Log SQL queries in debug mode
    )
    logger.info("MSSQL database engine created successfully with pymssql")
    
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    logger.error(f"Connection string: {settings.DATABASE_URL}")
    raise

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

def get_db() -> Session:
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database (create tables if they don't exist)"""
    try:
        # Test connection
        with engine.connect() as connection:
            logger.info("MSSQL database connection successful")
        
        # Note: Tables should already exist from .NET migrations
        # We're just importing the models to ensure they're mapped correctly
        from app.models import CVFileModel, CVAnalysisResultModel, KeywordMatchModel, JobProfileModel
        logger.info("Database models imported successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
