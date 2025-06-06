from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Union, Optional
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

class NodeConfig(BaseModel):
    type: str
    connection: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    metrics: Optional[List[str]] = None
    format: Optional[Dict[str, Any]] = None
    destination: Optional[Dict[str, Any]] = None

class DagNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class DagEdge(BaseModel):
    id: str
    source: str
    target: str

class SyntheticDataDAG(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    nodes: List[DagNode]
    edges: List[DagEdge]

@router.post("/dags/")
async def create_dag(dag: SyntheticDataDAG, db: Session = Depends(get_db)):
    try:
        # Create DB DAG first
        db_dag = DBSyntheticDataDAG(
            name=dag.name,
            description=dag.description,
        )
        db.add(db_dag)
        db.flush()  # Get the ID without committing transaction
        
        # Keep track of frontend_id -> database_id mapping for nodes
        node_id_mapping = {}
        
        # Add nodes with proper ID handling
        for node_data in dag.nodes:
            db_node = DBDagNode(
                dag_id=db_dag.id,
                node_type=node_data.type,
                config=node_data.data,
                position=node_data.position,
            )
            db.add(db_node)
            db.flush()  # Get the generated database ID
            
            # Map frontend ID to database ID for reference
            node_id_mapping[node_data.id] = db_node.id

        # Add edges - keep using frontend node IDs for now
        for edge_data in dag.edges:
            db_edge = DBDagEdge(
                dag_id=db_dag.id,
                source_node_id=edge_data.source,
                target_node_id=edge_data.target,
            )
            db.add(db_edge)

        # Commit all changes at once
        db.commit()
        db.refresh(db_dag)

        # Return the created DAG in the format expected by frontend
        return {
            "id": db_dag.id,
            "name": db_dag.name,
            "description": db_dag.description,
            "nodes": [
                {
                    "id": node.id,  # Keep frontend ID
                    "type": node.type,
                    "position": node.position,
                    "data": node.data
                } for node in dag.nodes
            ],
            "edges": [
                {
                    "id": edge.id,  # Keep frontend ID
                    "source": edge.source,
                    "target": edge.target
                } for edge in dag.edges
            ]
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error creating DAG: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create DAG: {str(e)}"
        )

@router.get("/dags/{dag_id}/")
async def get_dag(dag_id: int, db: Session = Depends(get_db)):
    try:
        db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
        if db_dag is None:
            raise HTTPException(status_code=404, detail="DAG not found")

        # Load related nodes and edges
        db_nodes = db.query(DBDagNode).filter(DBDagNode.dag_id == dag_id).all()
        db_edges = db.query(DBDagEdge).filter(DBDagEdge.dag_id == dag_id).all()

        # Convert database models to frontend format
        nodes_data = []
        for db_node in db_nodes:
            node_data = {
                "id": str(db_node.id),  # Convert DB ID to string for frontend
                "type": db_node.node_type,
                "position": db_node.position if db_node.position else {"x": 0, "y": 0},
                "data": db_node.config if db_node.config else {"label": f"{db_node.node_type} Node"}
            }
            nodes_data.append(node_data)

        edges_data = []
        for db_edge in db_edges:
            edge_data = {
                "id": str(db_edge.id),  # Convert DB ID to string for frontend
                "source": db_edge.source_node_id,
                "target": db_edge.target_node_id
            }
            edges_data.append(edge_data)

        return {
            "id": db_dag.id,
            "name": db_dag.name,
            "description": db_dag.description,
            "nodes": nodes_data,
            "edges": edges_data
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"Error getting DAG {dag_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve DAG: {str(e)}"
        )

@router.put("/dags/{dag_id}/")
async def update_dag(dag_id: int, updated_dag: SyntheticDataDAG, db: Session = Depends(get_db)):
    try:
        db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
        if db_dag is None:
            raise HTTPException(status_code=404, detail="DAG not found")

        # Update DAG attributes
        db_dag.name = updated_dag.name
        db_dag.description = updated_dag.description

        # Delete existing nodes and edges for this DAG
        db.query(DBDagNode).filter(DBDagNode.dag_id == dag_id).delete(synchronize_session=False)
        db.query(DBDagEdge).filter(DBDagEdge.dag_id == dag_id).delete(synchronize_session=False)

        # Add updated nodes
        for node_data in updated_dag.nodes:
            db_node = DBDagNode(
                dag_id=db_dag.id,
                node_type=node_data.type,
                config=node_data.data,
                position=node_data.position,
            )
            db.add(db_node)

        # Add updated edges
        for edge_data in updated_dag.edges:
            db_edge = DBDagEdge(
                dag_id=db_dag.id,
                source_node_id=edge_data.source,
                target_node_id=edge_data.target,
            )
            db.add(db_edge)

        db.commit()
        
        return {"message": "DAG updated successfully", "dag_id": db_dag.id}
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        db.rollback()
        print(f"Error updating DAG {dag_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update DAG: {str(e)}"
        )

@router.delete("/dags/{dag_id}/")
async def delete_dag(dag_id: int, db: Session = Depends(get_db)):
    try:
        db_dag = db.query(DBSyntheticDataDAG).filter(DBSyntheticDataDAG.id == dag_id).first()
        if db_dag is None:
            raise HTTPException(status_code=404, detail="DAG not found")

        # Delete the DAG (cascade will handle nodes and edges)
        db.delete(db_dag)
        db.commit()

        return {"message": "DAG deleted successfully"}
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        db.rollback()
        print(f"Error deleting DAG {dag_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete DAG: {str(e)}"
        )

# Additional utility endpoint to list all DAGs
@router.get("/dags/")
async def list_dags(db: Session = Depends(get_db)):
    try:
        db_dags = db.query(DBSyntheticDataDAG).all()
        
        dags_list = []
        for db_dag in db_dags:
            # Get node and edge counts for summary
            node_count = db.query(DBDagNode).filter(DBDagNode.dag_id == db_dag.id).count()
            edge_count = db.query(DBDagEdge).filter(DBDagEdge.dag_id == db_dag.id).count()
            
            dag_summary = {
                "id": db_dag.id,
                "name": db_dag.name,
                "description": db_dag.description,
                "created_at": db_dag.created_at.isoformat() if db_dag.created_at else None,
                "updated_at": db_dag.updated_at.isoformat() if db_dag.updated_at else None,
                "node_count": node_count,
                "edge_count": edge_count
            }
            dags_list.append(dag_summary)
        
        return {"dags": dags_list, "total": len(dags_list)}
        
    except Exception as e:
        print(f"Error listing DAGs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list DAGs: {str(e)}"
        )