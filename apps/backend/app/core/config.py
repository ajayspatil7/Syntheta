# apps/backend/app/core/config.py (Updated for production)
from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "production"
    
    # Database - Railway will provide this
    DATABASE_URL: str
    
    # Redis (optional for MVP)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Authentication
    AUTH_SECRET_KEY: str
    AUTH_ALGORITHM: str = "HS256"
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Auth0 (optional)
    AUTH0_DOMAIN: str = ""
    AUTH0_API_AUDIENCE: str = ""
    AUTH0_ALGORITHMS: List[str] = ["RS256"]
    
    # Storage (configure later)
    STORAGE_BUCKET: str = "syntheta-storage"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "syntheta"
    
    # MLflow (optional for MVP)
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "syntheta"
    
    # Temporal (optional for MVP)
    TEMPORAL_HOST: str = "localhost"
    TEMPORAL_PORT: int = 7233
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
