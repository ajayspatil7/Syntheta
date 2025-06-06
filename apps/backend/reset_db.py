# apps/backend/reset_db.py
from sqlalchemy import text
from app.db.session import engine, Base
from app.models import dag, user, workspace

def reset_database():
    """Drop and recreate all tables with correct schema"""
    print("🗑️  Dropping existing tables...")
    
    with engine.connect() as connection:
        # Drop tables in correct order (reverse of dependencies)
        drop_statements = [
            "DROP TABLE IF EXISTS dagedges CASCADE;",
            "DROP TABLE IF EXISTS dagnodes CASCADE;", 
            "DROP TABLE IF EXISTS node_edge_association CASCADE;",
            "DROP TABLE IF EXISTS dag_runs CASCADE;",
            "DROP TABLE IF EXISTS dags CASCADE;",
            "DROP TABLE IF EXISTS syntheticdatadags CASCADE;",
        ]
        
        for stmt in drop_statements:
            try:
                connection.execute(text(stmt))
                print(f"✅ Executed: {stmt}")
            except Exception as e:
                print(f"⚠️  Warning: {stmt} - {e}")
        
        connection.commit()
    
    print("🏗️  Creating tables with corrected schema...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset complete!")

if __name__ == "__main__":
    reset_database()