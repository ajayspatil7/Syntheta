from ast import alias
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from fastapi.middleware.cors import CORSMiddleware

def get_cors_settings() -> dict:
    return {
        "allow_origins": ["*"],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

class Settings(BaseSettings):
    # Environment
    environment: str = Field("production", alias="ENVIRONMENT")
    debug: bool = Field(False, alias="DEBUG")
    log_level: str = Field("INFO", alias="LOG_LEVEL")



    # Database
    database_url: str = Field(..., alias="DATABASE_URL")
    external_database_url: Optional[str] = Field(None, alias="EXTERNAL_DATABASE_URL")

    # Redis
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")
    external_redis_url: Optional[str] = Field(None, alias="EXTERNAL_REDIS_URL")

    # Authentication
    auth_secret_key: str = Field(..., alias="AUTH_SECRET_KEY")
    auth_algorithm: str = Field("HS256", alias="AUTH_ALGORITHM")
    auth_access_token_expire_minutes: int = Field(30, alias="AUTH_ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(7, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    algorithm: str = Field("HS256", alias="JWT_ALGORITHM")

    # Auth0
    auth0_domain: str = Field("", alias="AUTH0_DOMAIN")
    auth0_api_audience: str = Field("", alias="AUTH0_API_AUDIENCE")
    auth0_algorithms: List[str] = Field(default_factory=lambda: ["RS256"], alias="AUTH0_ALGORITHMS")

    # Storage (MinIO)
    storage_bucket: str = Field("syntheta-storage", alias="STORAGE_BUCKET")
    minio_endpoint: str = Field("localhost:9000", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field("minioadmin", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field("minioadmin", alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field("syntheta", alias="MINIO_BUCKET")

    # MLflow
    mlflow_tracking_uri: str = Field("http://localhost:5000", alias="MLFLOW_TRACKING_URI")
    mlflow_experiment_name: str = Field("syntheta", alias="MLFLOW_EXPERIMENT_NAME")

    # Temporal
    temporal_host: str = Field("localhost", alias="TEMPORAL_HOST")
    temporal_port: int = Field(7233, alias="TEMPORAL_PORT")

    api_v1_str: str = Field("/api/v1", alias="API_V1_STR")

    # CORS
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS")

    # PgAdmin (if used)
    pgadmin_email: Optional[str] = Field(None, alias="PGADMIN_EMAIL")
    pgadmin_password: Optional[str] = Field(None, alias="PGADMIN_PASSWORD")

    # Postgres
    postgres_password: Optional[str] = Field("postgres", alias="POSTGRES_PASSWORD")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "populate_by_name": True,
        "case_sensitive": True,
    }

settings = Settings()