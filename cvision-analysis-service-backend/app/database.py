from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from loguru import logger
import pyodbc
from app.core.config import settings

# Create database engine
try:
    # Check ODBC drivers
    drivers = [driver for driver in pyodbc.drivers() if "SQL Server" in driver]
    if drivers:
        logger.info(f"Available SQL Server drivers: {drivers}")
    else:
        logger.warning("No SQL Server ODBC drivers found")
    
    # Create engine with connection pooling
    engine = create_engine(
        settings.get_database_url(),
        poolclass=StaticPool,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG  # Log SQL queries in debug mode
    )
    logger.info("Database engine created successfully")
    
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
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
            logger.info("Database connection successful")
        
        # Note: Tables should already exist from .NET migrations
        # We're just importing the models to ensure they're mapped correctly
        from app.models import CVFileModel, CVAnalysisResultModel, KeywordMatchModel, JobProfileModel
        logger.info("Database models imported successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
