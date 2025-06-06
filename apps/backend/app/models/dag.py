from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.db.session import Base

class SyntheticDataDAG(Base):
    __tablename__ = "syntheticdatadags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    nodes = relationship("DagNode", back_populates="dag", cascade="all, delete-orphan")
    edges = relationship("DagEdge", back_populates="dag", cascade="all, delete-orphan")

class DagNode(Base):
    __tablename__ = "dagnodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    frontend_id = Column(String, index=True)  # Store the frontend's UUID
    dag_id = Column(Integer, ForeignKey("syntheticdatadags.id"))
    node_type = Column(String)
    config = Column(JSON)
    position = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dag = relationship("SyntheticDataDAG", back_populates="nodes")

class DagEdge(Base):
    __tablename__ = "dagedges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dag_id = Column(Integer, ForeignKey("syntheticdatadags.id"))
    source_node_id = Column(String, index=True)  # Frontend UUID
    target_node_id = Column(String, index=True)  # Frontend UUID
    edge_type = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dag = relationship("SyntheticDataDAG", back_populates="edges")

# Simplified versions of other models (no problematic relationships)
class DAG(Base):
    __tablename__ = "dags"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add workspace relationship
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    workspace = relationship("Workspace", back_populates="dags")
    
    # Keep DAGRun relationship
    runs = relationship("DAGRun", back_populates="dag", cascade="all, delete-orphan")

class DAGRun(Base):
    __tablename__ = "dag_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dag_id = Column(Integer, ForeignKey("dags.id"))
    status = Column(String)  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)
    
    # Relationships
    dag = relationship("DAG", back_populates="runs")