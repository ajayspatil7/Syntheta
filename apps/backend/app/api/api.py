from fastapi import APIRouter
from app.api.routes import auth, users, dags, dag_runs, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dags.router, prefix="/dags", tags=["dags"])
api_router.include_router(dag_runs.router, prefix="/dag-runs", tags=["dag-runs"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"]) 