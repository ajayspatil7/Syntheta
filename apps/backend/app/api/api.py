from fastapi import APIRouter
from app.api.routes import auth, dags, dag_runs

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dags.router, prefix="/dags", tags=["dags"])
api_router.include_router(dag_runs.router, prefix="/dag-runs", tags=["dag-runs"]) 