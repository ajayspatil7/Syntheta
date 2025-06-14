from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.dag import DAG, DAGRun
from app.core.auth import get_current_active_user
from app.models.user import User
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        # Get user's workspace
        workspace = current_user.workspace
        if not workspace:
            raise HTTPException(status_code=404, detail="No workspace found for user")

        # Get total pipelines for the workspace
        total_pipelines = db.query(func.count(DAG.id)).filter(
            DAG.workspace_id == workspace.id
        ).scalar() or 0

        # Get active runs in last 24 hours for the workspace
        last_24h = datetime.utcnow() - timedelta(hours=24)
        active_runs = db.query(func.count(DAGRun.id)).join(
            DAG, DAGRun.dag_id == DAG.id
        ).filter(
            DAG.workspace_id == workspace.id,
            DAGRun.started_at >= last_24h,
            DAGRun.status.in_(["pending", "running"])
        ).scalar() or 0

        # Get success rate for last 30 days for the workspace
        last_30d = datetime.utcnow() - timedelta(days=30)
        total_runs = db.query(func.count(DAGRun.id)).join(
            DAG, DAGRun.dag_id == DAG.id
        ).filter(
            DAG.workspace_id == workspace.id,
            DAGRun.started_at >= last_30d
        ).scalar() or 0
        
        successful_runs = db.query(func.count(DAGRun.id)).join(
            DAG, DAGRun.dag_id == DAG.id
        ).filter(
            DAG.workspace_id == workspace.id,
            DAGRun.started_at >= last_30d,
            DAGRun.status == "completed"
        ).scalar() or 0
        
        success_rate = successful_runs / total_runs if total_runs > 0 else 0

        # Get recent activity (last 5 runs) for the workspace
        recent_activity = db.query(DAGRun).join(
            DAG, DAGRun.dag_id == DAG.id
        ).filter(
            DAG.workspace_id == workspace.id
        ).order_by(
            DAGRun.started_at.desc()
        ).limit(5).all()

        # Get pipeline status distribution
        status_distribution = db.query(
            DAGRun.status,
            func.count(DAGRun.id)
        ).join(
            DAG, DAGRun.dag_id == DAG.id
        ).filter(
            DAG.workspace_id == workspace.id,
            DAGRun.started_at >= last_30d
        ).group_by(
            DAGRun.status
        ).all()

        return {
            "total_pipelines": total_pipelines,
            "active_runs_24h": active_runs,
            "success_rate_30d": success_rate,
            "status_distribution": dict(status_distribution),
            "recent_activity": [
                {
                    "id": run.id,
                    "dag_id": run.dag_id,
                    "dag_name": run.dag.name,
                    "status": run.status,
                    "started_at": run.started_at.isoformat() if run.started_at else None,
                    "completed_at": run.completed_at.isoformat() if run.completed_at else None,
                    "error": run.error,
                    "metrics": run.metrics
                }
                for run in recent_activity
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 