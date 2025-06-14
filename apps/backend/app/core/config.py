from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets
from typing import Optional, List, Union  # Add Union here


class Settings(BaseSettings):
    # =============================================================================
    # ENVIRONMENT
    # =============================================================================
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # =============================================================================
    # DATABASE CONFIGURATION
    # =============================================================================
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/syntheta"
    POSTGRES_DB: str = "syntheta"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    
    # Test Database
    TEST_DATABASE_URL: Optional[str] = None
    
    @validator("TEST_DATABASE_URL", pre=True)
    def assemble_test_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@localhost:5432/syntheta_test"
    
    # =============================================================================
    # AUTHENTICATION & SECURITY
    # =============================================================================
    SECRET_KEY: str = "eb454b2c60df0665e4d4f8633df18477b7b603a85940ce0d15a810f6a12251f2"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Auth0 Configuration (Optional)
    AUTH0_DOMAIN: Optional[str] = None
    AUTH0_API_AUDIENCE: Optional[str] = None
    AUTH0_ALGORITHMS: List[str] = ["RS256"]
    
    # Alternative JWT Configuration
    AUTH_SECRET_KEY: str = "eb454b2c60df0665e4d4f8633df18477b7b603a85940ce0d15a810f6a12251f2"
    AUTH_ALGORITHM: str = "HS256"
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # =============================================================================
    # REDIS CONFIGURATION
    # =============================================================================
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # =============================================================================
    # TEMPORAL WORKFLOW ENGINE
    # =============================================================================
    TEMPORAL_HOST: str = "localhost"
    TEMPORAL_PORT: int = 7233
    TEMPORAL_NAMESPACE: str = "default"
    
    # =============================================================================
    # STORAGE CONFIGURATION
    # =============================================================================
    # MinIO Configuration
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "syntheta"
    MINIO_SECURE: bool = False
    
    # S3 Configuration (Alternative)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "syntheta-storage"
    
    # General Storage
    STORAGE_BUCKET: str = "syntheta-storage"
    STORAGE_PATH: str = "/data/syntheta"
    
    # =============================================================================
    # MLFLOW CONFIGURATION
    # =============================================================================
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "syntheta"
    MLFLOW_S3_ENDPOINT_URL: Optional[str] = "http://localhost:9000"
    MLFLOW_ARTIFACT_ROOT: Optional[str] = "s3://syntheta/mlflow-artifacts"
    
    # =============================================================================
    # API CONFIGURATION
    # =============================================================================
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Syntheta API"
    PROJECT_DESCRIPTION: str = "API for synthetic data generation and pipeline management"
    PROJECT_VERSION: str = "0.1.0"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True
    
    # =============================================================================
    # SYNTHETIC DATA GENERATION
    # =============================================================================
    # Model Storage
    MODELS_PATH: str = "/data/models"
    DATASETS_PATH: str = "/data/datasets"
    OUTPUTS_PATH: str = "/data/outputs"
    
    # Generation Limits
    MAX_GENERATION_SIZE: int = 10000
    MAX_CONCURRENT_JOBS: int = 5
    DEFAULT_BATCH_SIZE: int = 32
    
    # =============================================================================
    # MONITORING & LOGGING
    # =============================================================================
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: Optional[str] = None
    
    # Prometheus Metrics
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 8001
    
    # =============================================================================
    # DEVELOPMENT SETTINGS
    # =============================================================================
    RELOAD: bool = True
    WORKERS: int = 1
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v: str) -> str:
        if not v:
            return secrets.token_urlsafe(32)
        return v
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError("CORS_ORIGINS must be a string or list")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow extra fields for flexibility
        extra = "allow"


# Create settings instance
settings = Settings()


# Helper functions for common configurations
def get_database_url() -> str:
    """Get the database URL for SQLAlchemy."""
    return settings.DATABASE_URL


def get_redis_url() -> str:
    """Get the Redis URL for async Redis client."""
    return settings.REDIS_URL


def get_cors_settings() -> dict:
    """Get CORS middleware settings."""
    return {
        "allow_origins": settings.CORS_ORIGINS,
        "allow_credentials": settings.CORS_ALLOW_CREDENTIALS,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }


def get_jwt_settings() -> dict:
    """Get JWT authentication settings."""
    return {
        "secret_key": settings.SECRET_KEY,
        "algorithm": settings.ALGORITHM,
        "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    }


def is_development() -> bool:
    """Check if running in development mode."""
    return settings.ENVIRONMENT.lower() == "development"


def is_production() -> bool:
    """Check if running in production mode."""
    return settings.ENVIRONMENT.lower() == "production"