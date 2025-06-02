from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.db.session import Base
from app.models.workspace import Workspace
from app.models.user import User

class DAG(Base):
    __tablename__ = "dags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    config = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    
    # Relationships
    workspace = relationship("Workspace", back_populates="dags")
    runs = relationship("DAGRun", back_populates="dag", cascade="all, delete-orphan")

class DAGRun(Base):
    __tablename__ = "dag_runs"

    id = Column(Integer, primary_key=True, index=True)
    dag_id = Column(Integer, ForeignKey("dags.id"))
    status = Column(String)  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True)
    
    # Relationships
    dag = relationship("DAG", back_populates="runs")

# Association table for many-to-many relationship between nodes and edges
node_edge_association = Table(
    'node_edge_association',
    Base.metadata,
    Column('node_id', Integer, ForeignKey('dagnodes.id')),
    Column('edge_id', Integer, ForeignKey('dagedges.id'))
)

class SyntheticDataDAG(Base):
    __tablename__ = "syntheticdatadags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    nodes = relationship("DagNode", back_populates="dag", cascade="all, delete-orphan")
    edges = relationship("DagEdge", back_populates="dag", cascade="all, delete-orphan")

class DagNode(Base):
    __tablename__ = "dagnodes"

    id = Column(Integer, primary_key=True, index=True)
    dag_id = Column(Integer, ForeignKey("syntheticdatadags.id"))
    node_type = Column(String)  # e.g., "data_source", "transformation", "output"
    config = Column(JSON)
    position = Column(JSON)  # Store x, y coordinates as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dag = relationship("SyntheticDataDAG", back_populates="nodes")
    incoming_edges = relationship("DagEdge", 
                                foreign_keys="DagEdge.target_node_id",
                                back_populates="target_node")
    outgoing_edges = relationship("DagEdge", 
                                foreign_keys="DagEdge.source_node_id",
                                back_populates="source_node")

class DagEdge(Base):
    __tablename__ = "dagedges"

    id = Column(Integer, primary_key=True, index=True)
    dag_id = Column(Integer, ForeignKey("syntheticdatadags.id"))
    source_node_id = Column(Integer, ForeignKey("dagnodes.id"))
    target_node_id = Column(Integer, ForeignKey("dagnodes.id"))
    edge_type = Column(String)  # e.g., "data_flow", "control_flow"
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    dag = relationship("SyntheticDataDAG", back_populates="edges")
    source_node = relationship("DagNode", 
                             foreign_keys=[source_node_id],
                             back_populates="outgoing_edges")
    target_node = relationship("DagNode", 
                             foreign_keys=[target_node_id],
                             back_populates="incoming_edges")

# Add other models here if needed (e.g., for Users, Workspaces, etc.) 