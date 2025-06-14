"""
Database migration script for production deployment
"""
import asyncio
import sys
from sqlalchemy import create_engine, text
from app.db.session import Base
from app.core.config import settings

# Import all models to ensure they're registered
from app.models.dag import SyntheticDataDAG, DagNode, DagEdge
from app.models.workspace import Workspace
from app.models.user import User

async def create_tables():
    """Create all database tables"""
    try:
        print("🔗 Connecting to database...")
        engine = create_engine(settings.DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
        
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        with engine.connect() as conn:
            tables_result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in tables_result]
            print(f"📋 Created tables: {tables}")
            
    except Exception as e:
        print(f"❌ Database migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(create_tables())
