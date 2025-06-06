from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import dags, db

app = FastAPI(
    title="Syntheta API",
    description="API for synthetic data generation and pipeline management",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def create_tables():
    """Create database tables on startup"""
    print("🚀 Starting up Syntheta API...")
    
    try:
        # Import inside the function to avoid circular imports
        from app.db.session import Base, engine
        from app.models import user, workspace, dag
        from sqlalchemy import text  # Import text for raw SQL
        
        print("📦 Imported database models successfully")
        print(f"🔗 Database URL from config: {engine.url}")
        
        # Test database connection first (fixed syntax)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
        
        print("🔧 Creating database tables...")
        
        # This will create all tables defined in your SQLAlchemy models
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        
        # Check which tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        print(f"📋 Available tables: {table_names}")
        
        if table_names:
            print("🎉 Success! Tables are ready for use.")
        else:
            print("⚠️  No tables found - there might be an issue with model definitions")
        
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        import traceback
        traceback.print_exc()
        print("⚠️  App will continue, but database operations may fail")

# Include routers
app.include_router(dags.router, prefix="/api/v1")
app.include_router(db.router, prefix="/api")

@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "Welcome to Syntheta API",
            "version": "0.1.0",
            "status": "operational",
        }
    )

@app.get("/health")
async def health_check():
    return JSONResponse(
        content={
            "status": "healthy",
            "version": "0.1.0",
        }
    )

@app.get("/debug/tables")
async def debug_tables():
    """Debug endpoint to check tables"""
    try:
        from app.db.session import engine
        from sqlalchemy import inspect, text
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # Also test a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT current_database()"))
            db_name = result.scalar()
        
        return {
            "database": db_name,
            "tables": tables, 
            "count": len(tables),
            "status": "connected"
        }
    except Exception as e:
        return {"error": str(e), "status": "error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)