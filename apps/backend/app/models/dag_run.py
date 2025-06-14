from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Interval
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class DAGRun(Base):
    __tablename__ = "dag_runs"

    id = Column(Integer, primary_key=True, index=True)
    dag_id = Column(String, ForeignKey("dags.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, running, success, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration = Column(Interval, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    dag = relationship("DAG", back_populates="runs")

    def __repr__(self):
        return f"<DAGRun(id={self.id}, dag_id={self.dag_id}, status={self.status})>" 