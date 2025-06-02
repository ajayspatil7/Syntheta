from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from sqlalchemy import text

from app.db.session import get_db
from app.models.dag import SyntheticDataDAG as DBSyntheticDataDAG, DagNode as DBDagNode, DagEdge as DBDagEdge

from pydantic import BaseModel

router = APIRouter()

@router.get("/test-db-connection")
async def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query
        result = db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )

# In-memory storage for demonstration. Replace with database in the future.
dags_db: Dict[str, Dict[str, Any]] = {}

class NodeConfig(BaseModel):
    type: str
    connection: Dict[str, Any] | None = None
    parameters: Dict[str, Any] | None = None
    metrics: List[str] | None = None
    format: Dict[str, Any] | None = None
    destination: Dict[str, Any] | None = None

class DagNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]
    # Add any other relevant node properties from reactflow

class DagEdge(BaseModel):
    id: str
    source: str
    target: str
    # Add any other relevant edge properties from reactflow

class SyntheticDataDAG(BaseModel):
    id: int | None = None # Now expect an integer ID from the database
    name: str
    description: str | None = None
    nodes: List[DagNode]
    edges: List[DagEdge]

@router.post("/dags/")
async def create_dag(dag: SyntheticDataDAG, db: Session = Depends(get_db)):
    # Create DB models from Pydantic model
    db_dag = DBSyntheticDataDAG(
        name=dag.name,
        description=dag.description,
    )

    db.add(db_dag)
    db.commit()
    db.refresh(db_dag)

    # Add nodes and edges with foreign key to the new DAG
    for node_data in dag.nodes:
        db_node = DBDagNode(
            dag_id=db_dag.id,
            node_type=node_data.type,
            config=node_data.data,
            position=node_data.position,
        )
        db.add(db_node)

    for edge_data in dag.edges:
        db_edge = DBDagEdge(
            dag_id=db_dag.id,
            source_node_id=edge_data.source,
            target_node_id=edge_data.target,
        )
        db.add(db_edge)

    db.commit()
    db.refresh(db_dag)

    # Return the created DAG with the assigned DB ID
    return SyntheticDataDAG.model_validate(db_dag)

@router.get("/dags/{dag_id}/", response_model=SyntheticDataDAG)
async def get_dag(dag_id: int, db: Session = Depends(get_db)):
    db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
    if db_dag is None:
        raise HTTPException(status_code=404, detail="DAG not found")

    # Load related nodes and edges
    db_nodes = db.query(DBDagNode).filter(DBDagNode.dag_id == dag_id).all()
    db_edges = db.query(DBDagEdge).filter(DBDagEdge.dag_id == dag_id).all()

    # Construct Pydantic model from DB models
    dag_data = {
        "id": db_dag.id,
        "name": db_dag.name,
        "description": db_dag.description,
        "nodes": [DagNode.model_validate(node) for node in db_nodes],
        "edges": [DagEdge.model_validate(edge) for edge in db_edges],
    }

    return SyntheticDataDAG.model_validate(dag_data)

@router.put("/dags/{dag_id}/")
async def update_dag(dag_id: int, updated_dag: SyntheticDataDAG, db: Session = Depends(get_db)):
    db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
    if db_dag is None:
        raise HTTPException(status_code=404, detail="DAG not found")

    # Update DAG attributes
    db_dag.name = updated_dag.name
    db_dag.description = updated_dag.description

    # Delete existing nodes and edges for this DAG
    db.query(DBDagNode).filter(DBDagNode.dag_id == dag_id).delete()
    db.query(DBDagEdge).filter(DBDagEdge.dag_id == dag_id).delete()
    db.commit()

    # Add updated nodes and edges
    for node_data in updated_dag.nodes:
        db_node = DBDagNode(
            dag_id=db_dag.id,
            node_type=node_data.type,
            config=node_data.data,
            position=node_data.position,
        )
        db.add(db_node)

    for edge_data in updated_dag.edges:
        db_edge = DBDagEdge(
            dag_id=db_dag.id,
            source_node_id=edge_data.source,
            target_node_id=edge_data.target,
        )
        db.add(db_edge)

    db.commit()
    db.refresh(db_dag)

    return {"message": "DAG updated successfully", "dag_id": db_dag.id}

@router.delete("/dags/{dag_id}/")
async def delete_dag(dag_id: int, db: Session = Depends(get_db)):
    db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
    if db_dag is None:
        raise HTTPException(status_code=404, detail="DAG not found")

    db.delete(db_dag)
    db.commit()

    return {"message": "DAG deleted successfully"} 