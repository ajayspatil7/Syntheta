# apps/backend/test_dag_ops.py
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.dag import SyntheticDataDAG, DagNode, DagEdge

def test_dag_operations():
    """Test basic DAG operations to ensure everything works"""
    db = SessionLocal()
    
    try:
        print("🧪 Testing DAG operations...")
        
        # Create a test DAG
        test_dag = SyntheticDataDAG(
            name="Test DAG",
            description="A test DAG to verify operations"
        )
        db.add(test_dag)
        db.flush()  # Get the ID
        
        print(f"✅ Created DAG with ID: {test_dag.id}")
        
        # Create test nodes
        source_node = DagNode(
            dag_id=test_dag.id,
            node_type="source",
            config={"label": "Source Node", "type": "csv"},
            position={"x": 100, "y": 100}
        )
        db.add(source_node)
        db.flush()
        
        generator_node = DagNode(
            dag_id=test_dag.id,
            node_type="generator", 
            config={"label": "Generator Node", "type": "ctgan"},
            position={"x": 300, "y": 100}
        )
        db.add(generator_node)
        db.flush()
        
        print(f"✅ Created nodes with IDs: {source_node.id}, {generator_node.id}")
        
        # Create test edge using frontend-style UUIDs
        test_edge = DagEdge(
            dag_id=test_dag.id,
            source_node_id="frontend-uuid-source-123",
            target_node_id="frontend-uuid-generator-456"
        )
        db.add(test_edge)
        db.flush()
        
        print(f"✅ Created edge with ID: {test_edge.id}")
        
        # Commit all changes
        db.commit()
        
        # Test retrieval
        retrieved_dag = db.query(SyntheticDataDAG).filter(SyntheticDataDAG.id == test_dag.id).first()
        nodes = db.query(DagNode).filter(DagNode.dag_id == test_dag.id).all()
        edges = db.query(DagEdge).filter(DagEdge.dag_id == test_dag.id).all()
        
        print(f"✅ Retrieved DAG: {retrieved_dag.name}")
        print(f"✅ Retrieved {len(nodes)} nodes and {len(edges)} edges")
        
        # Clean up test data
        db.delete(retrieved_dag)  # Cascade will delete nodes and edges
        db.commit()
        
        print("✅ Test completed successfully - all operations work!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    test_dag_operations()