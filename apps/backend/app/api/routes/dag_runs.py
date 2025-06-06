from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.dag import DAGRun, ExecutionLog
from app.core.middleware.rbac import require_permissions
from app.schemas.dag import DAGRunResponse, ExecutionLogResponse

router = APIRouter()

@router.get("/dags/{dag_id}/runs", response_model=List[DAGRunResponse])
@require_permissions(["dag:view:runs"])
async def get_dag_runs(
    dag_id: int,
    time_filter: str = Query("24h", regex="^(24h|7d|30d|all)$"),
    status: Optional[str] = Query(None, regex="^(completed|failed|running|all)$"),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get DAG run history with filtering"""
    # Calculate time filter
    now = datetime.utcnow()
    if time_filter == "24h":
        start_time = now - timedelta(hours=24)
    elif time_filter == "7d":
        start_time = now - timedelta(days=7)
    elif time_filter == "30d":
        start_time = now - timedelta(days=30)
    else:
        start_time = None

    # Build query
    query = db.query(DAGRun).filter(DAGRun.dag_id == dag_id)
    
    if start_time:
        query = query.filter(DAGRun.started_at >= start_time)
    
    if status and status != "all":
        query = query.filter(DAGRun.status == status)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    runs = query.order_by(DAGRun.started_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return {
        "items": runs,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/dag-runs/{run_id}/logs", response_model=List[ExecutionLogResponse])
@require_permissions(["dag:view:logs"])
async def get_execution_logs(
    run_id: int,
    db: Session = Depends(get_db)
):
    """Get execution logs for a specific DAG run"""
    logs = db.query(ExecutionLog)\
        .filter(ExecutionLog.dag_run_id == run_id)\
        .order_by(ExecutionLog.started_at)\
        .all()
    
    return logs

@router.get("/dag-runs/{run_id}/metrics")
@require_permissions(["dag:view:metrics"])
async def get_run_metrics(
    run_id: int,
    db: Session = Depends(get_db)
):
    """Get aggregated metrics for a DAG run"""
    run = db.query(DAGRun).filter(DAGRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="DAG run not found")
    
    logs = db.query(ExecutionLog)\
        .filter(ExecutionLog.dag_run_id == run_id)\
        .all()
    
    # Calculate aggregated metrics
    total_duration = 0
    total_input_size = 0
    total_output_size = 0
    node_metrics = {}
    
    for log in logs:
        if log.metrics:
            total_duration += log.metrics.get("duration_seconds", 0)
            total_input_size += log.metrics.get("input_size_bytes", 0)
            total_output_size += log.metrics.get("output_size_bytes", 0)
            node_metrics[log.node_id] = log.metrics
    
    return {
        "total_duration_seconds": total_duration,
        "total_input_size_bytes": total_input_size,
        "total_output_size_bytes": total_output_size,
        "average_throughput_bytes_per_second": total_output_size / total_duration if total_duration > 0 else 0,
        "node_metrics": node_metrics
    } 