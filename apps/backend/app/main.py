from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings, get_cors_settings
from app.api.routes import dags, db
from app.api.v1.endpoints import auth


# Set up logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup/shutdown events.
    """
    # Startup
    logger.info("🚀 Starting Syntheta API...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Database URL: {settings.database_url}")
    logger.info(f"Redis URL: {settings.redis_url}")
    
    # Initialize any startup tasks here
    # - Database connection verification
    # - Cache warming
    # - Model loading
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Syntheta API...")


# Create FastAPI application
app = FastAPI(
    title="Syntheta Backend API",
    description="API backend for orchestrating synthetic data pipelines using Mirage Engine and Temporal workflows.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# =============================================================================
# MIDDLEWARE CONFIGURATION
# =============================================================================

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    **get_cors_settings()
)

# Trusted Host Middleware (for production)
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
    )


# =============================================================================
# EXCEPTION HANDLERS
# =============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "body": exc.body if hasattr(exc, 'body') else None,
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "detail": exc.detail,
            "status_code": exc.status_code,
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred" if settings.environment == "production" else str(exc),
        }
    )


# =============================================================================
# ROUTES
# =============================================================================

# Include API routers
# Include API routers
app.include_router(dags.router, prefix=settings.api_v1_str, tags=["dags"])
app.include_router(db.router, prefix="/api", tags=["database"])
app.include_router(auth.router, prefix=settings.api_v1_str, tags=["authentication"])


# =============================================================================
# HEALTH CHECK ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return JSONResponse(
        content={
            "message": "Welcome to Syntheta API",
            "description": "Orchestrate Synthetic Data Like a Pro",
            "version": "0.1.0",
            "status": "operational",
            "environment": settings.environment,
            "docs_url": "/docs" if settings.debug else None,
        }
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with service status."""
    health_status = {
        "status": "healthy",
        "version": "0.1.0",
        "environment": settings.environment,
        "timestamp": time.time(),
        "services": {
            "api": "healthy",
            "database": "unknown",  # Add actual DB check
            "redis": "unknown",     # Add actual Redis check
            "temporal": "unknown",  # Add actual Temporal check
        }
    }
    
    # Add actual service health checks here
    # Example:
    # try:
    #     # Check database connection
    #     health_status["services"]["database"] = "healthy"
    # except Exception:
    #     health_status["services"]["database"] = "unhealthy"
    #     health_status["status"] = "degraded"
    
    return JSONResponse(content=health_status)


@app.get("/info")
async def app_info():
    """Application information endpoint."""
    return JSONResponse(
        content={
            "name": "Syntheta API",
            "description": "API backend for orchestrating synthetic data pipelines using Mirage Engine and Temporal workflows.",
            "version": "0.1.0",
            "environment": settings.environment,
            "features": {
                "synthetic_data_generation": True,
                "pipeline_orchestration": True,
                "model_management": True,
                "data_validation": True,
                "bias_detection": True,
            },
            "supported_generators": [
                "StyleGAN",
                "DCGAN", 
                "WGAN-GP",
                "Stable Diffusion",
                "CTGAN",
                "CopulaGAN",
                "TVAE",
                "Custom Simulators"
            ],
            "supported_formats": [
                "CSV",
                "Parquet", 
                "JSON",
                "Images (PNG, JPG)",
                "NumPy Arrays"
            ]
        }
    )


# =============================================================================
# DEVELOPMENT ONLY ENDPOINTS
# =============================================================================

if settings.debug:
    @app.get("/debug/config")
    async def debug_config():
        """Debug endpoint to check configuration (development only)."""
        return JSONResponse(
            content={
                "environment": settings.environment,
                "database_url": settings.database_url.replace(settings.postgres_password, "***"),
                "redis_url": settings.redis_url,
                "cors_origins": settings.cors_origins,
                "debug": settings.debug,
            }
        )


# =============================================================================
# APPLICATION ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🚀 Starting Syntheta API on port 8000...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.RELOAD and settings.debug,
        workers=settings.WORKERS if not settings.debug else 1,
        log_level=settings.LOG_LEVEL.lower(),
    )