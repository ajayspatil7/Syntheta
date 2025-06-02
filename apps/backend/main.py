from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import dags, db

app = FastAPI(
    title="Syntheta API",
    description="API for synthetic data generation and pipeline management",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dags.router, prefix="/api/v1")
app.include_router(db.router, prefix="/api")

@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "Welcome to Syntheta API",
            "version": "0.1.0",
            "status": "operational",
        }
    )

@app.get("/health")
async def health_check():
    return JSONResponse(
        content={
            "status": "healthy",
            "version": "0.1.0",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 