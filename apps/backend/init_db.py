#!/usr/bin/env python3
"""
Database initialization script for Syntheta
Creates all tables and initial data
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.db.session import Base, engine, get_db
from app.models import user, workspace, dag
from app.core.config import settings

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    
    try:
        # Import all models to ensure they're registered with Base
        from app.models.user import User
        from app.models.workspace import Workspace
        from app.models.dag import (
            SyntheticDataDAG, 
            DagNode, 
            DagEdge, 
            DAG, 
            DAGRun
        )
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Test the connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection test passed!")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def create_initial_data():
    """Create initial data like admin user, default workspace, etc."""
    print("Creating initial data...")
    
    try:
        # Get a database session
        db = next(get_db())
        
        # Check if we already have users
        from app.models.user import User
        existing_user = db.query(User).first()
        
        if not existing_user:
            # Create default admin user
            admin_user = User(
                email="admin@syntheta.ai",
                hashed_password="$2b$12$dummy_hash_for_development",  # You should hash this properly
                full_name="Syntheta Admin",
                is_active=True,
                is_superuser=True,
                employment_status="Employed",
                current_role="System Administrator",
                experience_level="5+ years",
                primary_interests=["System Administration"],
                how_did_you_hear="Direct"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Created default admin user: admin@syntheta.ai")
        
        # Create default workspace if none exists
        from app.models.workspace import Workspace
        existing_workspace = db.query(Workspace).first()
        
        if not existing_workspace:
            default_workspace = Workspace(
                name="Default Workspace",
                description="Default workspace for Syntheta",
                owner_id=1  # Assuming admin user has ID 1
            )
            db.add(default_workspace)
            db.commit()
            print("✅ Created default workspace")
            
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        return False

def main():
    """Main initialization function"""
    print("🚀 Initializing Syntheta Database...")
    print(f"Database URL: {settings.database_url}")
    
    # Step 1: Create tables
    if not create_tables():
        sys.exit(1)
    
    # Step 2: Create initial data
    if not create_initial_data():
        print("⚠️ Warning: Could not create initial data, but tables are ready")
    
    print("🎉 Database initialization complete!")

if __name__ == "__main__":
    main()