from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import RedisDsn, validator

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://ajaysp@localhost:5432/syntheta"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Temporal
    TEMPORAL_HOST: str = "localhost"
    TEMPORAL_PORT: int = 7233
    
    # Authentication
    AUTH0_DOMAIN: str
    AUTH0_API_AUDIENCE: str
    AUTH0_ALGORITHMS: list[str] = ["RS256"]
    AUTH_SECRET_KEY: str = "your-secret-key"
    AUTH_ALGORITHM: str = "HS256"
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "syntheta"
    STORAGE_BUCKET: str = "syntheta-storage"
    
    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "syntheta"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 