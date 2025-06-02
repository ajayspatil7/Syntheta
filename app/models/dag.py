from sqlalchemy import Column, Integer, String
from app.db.session import Base
from sqlalchemy.orm import relationship
from app.models.workspace import Workspace

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    # Relationship to DAGs
    dags = relationship("DAG", back_populates="workspace") 