from temporalio import activity
from typing import Dict, Any
from app.models.dag import ExecutionLog, ErrorType
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import get_db

@activity.defn
async def execute_node(node: Dict[str, Any], run_id: str) -> Dict[str, Any]:
    """Execute a single node in the DAG"""
    activity.logger.info(f"Executing node {node['id']} for run {run_id}")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create execution log entry
        execution_log = ExecutionLog(
            dag_run_id=run_id,
            node_id=node['id'],
            status='running',
            started_at=datetime.utcnow(),
            input_data=node.get('input_data')
        )
        db.add(execution_log)
        db.commit()
        
        # Execute node based on type
        result = await _execute_node_by_type(node)
        
        # Update execution log
        execution_log.status = 'completed'
        execution_log.completed_at = datetime.utcnow()
        execution_log.output_data = result
        execution_log.calculate_metrics()
        
        db.commit()
        return result
        
    except Exception as e:
        # Handle error and update execution log
        execution_log.status = 'failed'
        execution_log.completed_at = datetime.utcnow()
        execution_log.error = str(e)
        execution_log.error_type = _categorize_error(e)
        db.commit()
        raise

async def _execute_node_by_type(node: Dict[str, Any]) -> Dict[str, Any]:
    """Execute node based on its type"""
    node_type = node['type']
    
    if node_type == 'source':
        return await _execute_source_node(node)
    elif node_type == 'generator':
        return await _execute_generator_node(node)
    elif node_type == 'evaluator':
        return await _execute_evaluator_node(node)
    elif node_type == 'exporter':
        return await _execute_exporter_node(node)
    else:
        raise ValueError(f"Unknown node type: {node_type}")

def _categorize_error(error: Exception) -> ErrorType:
    """Categorize the error type"""
    error_str = str(error).lower()
    
    if any(x in error_str for x in ['connection', 'timeout', 'network']):
        return ErrorType.INFRASTRUCTURE
    elif any(x in error_str for x in ['permission', 'access', 'auth']):
        return ErrorType.PERMISSION
    elif any(x in error_str for x in ['validation', 'schema', 'format']):
        return ErrorType.VALIDATION
    elif any(x in error_str for x in ['model', 'training', 'inference']):
        return ErrorType.MODEL
    else:
        return ErrorType.UNKNOWN 