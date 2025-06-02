from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter()

@router.get("/test-db-connection")
async def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Execute a simple query to test the connection
        result = db.execute(text("SELECT 1"))
        return {
            "status": "success",
            "message": "Database connection successful",
            "data": {"result": result.scalar()}
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        } 