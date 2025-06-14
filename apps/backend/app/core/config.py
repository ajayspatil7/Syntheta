from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Environment
    environment: str = Field("production", alias="ENVIRONMENT")
    
    # Database - Railway will provide this
    database_url: str = Field(..., alias="DATABASE_URL")
    
    # Redis (optional for MVP)
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")
    
    # Authentication
    auth_secret_key: str = Field(..., alias="AUTH_SECRET_KEY")
    auth_algorithm: str = Field("HS256", alias="AUTH_ALGORITHM")
    auth_access_token_expire_minutes: int = Field(30, alias="AUTH_ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Auth0 (optional)
    auth0_domain: str = Field("", alias="AUTH0_DOMAIN")
    auth0_api_audience: str = Field("", alias="AUTH0_API_AUDIENCE")
    auth0_algorithms: List[str] = Field(default_factory=lambda: ["RS256"], alias="AUTH0_ALGORITHMS")
    
    # Storage (configure later)
    storage_bucket: str = Field("syntheta-storage", alias="STORAGE_BUCKET")
    minio_endpoint: str = Field("localhost:9000", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field("minioadmin", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field("minioadmin", alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field("syntheta", alias="MINIO_BUCKET")
    
    # MLflow (optional for MVP)
    mlflow_tracking_uri: str = Field("http://localhost:5000", alias="MLFLOW_TRACKING_URI")
    mlflow_experiment_name: str = Field("syntheta", alias="MLFLOW_EXPERIMENT_NAME")
    
    # Temporal (optional for MVP)
    temporal_host: str = Field("localhost", alias="TEMPORAL_HOST")
    temporal_port: int = Field(7233, alias="TEMPORAL_PORT")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "populate_by_name": True,
        "case_sensitive": True,
        "extra": "forbid"  # Or "allow" if you expect extra env vars
    }

settings = Settings()