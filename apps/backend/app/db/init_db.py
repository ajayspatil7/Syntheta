from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models import user, workspace, dag

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!") 