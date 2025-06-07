# apps/backend/verify_db.py
"""
Script to verify database connection and list all tables
"""
import psycopg2
from sqlalchemy import create_engine, text, inspect
from app.core.config import settings
from app.db.session import engine

def check_database_connection():
    """Check if we can connect to PostgreSQL and the Syntheta database"""
    
    print("🔍 Checking Database Connection...")
    print(f"Database URL: {settings.DATABASE_URL}")
    
    try:
        # Test basic PostgreSQL connection
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            user="postgres", 
            password="postgres",
            database="postgres"  # Connect to default postgres database first
        )
        
        cursor = conn.cursor()
        
        # Check if syntheta database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='syntheta'")
        result = cursor.fetchone()
        
        if result:
            print("✅ 'syntheta' database exists")
        else:
            print("❌ 'syntheta' database does NOT exist")
            print("Creating 'syntheta' database...")
            
            # Create the database
            conn.autocommit = True
            cursor.execute("CREATE DATABASE syntheta")
            print("✅ Created 'syntheta' database")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ PostgreSQL connection error: {e}")
        return False
    
    return True

def list_tables():
    """List all tables in the syntheta database"""
    
    print("\n📊 Checking Tables in Syntheta Database...")
    
    try:
        # Connect to syntheta database specifically
        syntheta_engine = create_engine("postgresql://postgres:postgres@localhost:5432/syntheta")
        
        with syntheta_engine.connect() as connection:
            # Get table names
            inspector = inspect(syntheta_engine)
            tables = inspector.get_table_names()
            
            if tables:
                print(f"✅ Found {len(tables)} tables:")
                for i, table in enumerate(tables, 1):
                    print(f"   {i}. {table}")
                    
                    # Get column info for each table
                    columns = inspector.get_columns(table)
                    print(f"      Columns: {len(columns)}")
                    for col in columns[:3]:  # Show first 3 columns
                        print(f"        - {col['name']} ({col['type']})")
                    if len(columns) > 3:
                        print(f"        ... and {len(columns) - 3} more columns")
                    print()
            else:
                print("❌ No tables found in 'syntheta' database")
                
    except Exception as e:
        print(f"❌ Error connecting to syntheta database: {e}")
        return False
    
    return True

def check_table_data():
    """Check if tables have data"""
    
    print("\n📈 Checking Table Data...")
    
    try:
        with engine.connect() as connection:
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            for table in tables:
                try:
                    result = connection.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"   {table}: {count} rows")
                except Exception as e:
                    print(f"   {table}: Error - {e}")
                    
    except Exception as e:
        print(f"❌ Error checking table data: {e}")

def main():
    """Run all database checks"""
    
    print("🚀 Syntheta Database Verification")
    print("=" * 50)
    
    # Step 1: Check database exists
    if not check_database_connection():
        print("\n❌ Failed to connect to PostgreSQL. Check if PostgreSQL is running.")
        return
    
    # Step 2: List tables
    if not list_tables():
        print("\n❌ Failed to list tables. Database might be empty.")
        return
    
    # Step 3: Check table data
    check_table_data()
    
    print("\n🎯 TablePlus Connection Tips:")
    print("1. Make sure you're connecting to the 'syntheta' database (not 'postgres')")
    print("2. Connection settings:")
    print("   - Host: localhost")
    print("   - Port: 5432") 
    print("   - Database: syntheta")
    print("   - User: postgres")
    print("   - Password: postgres")
    print("3. Try refreshing the schema in TablePlus (Cmd+R or F5)")
    print("4. Check the 'public' schema in the left sidebar")

if __name__ == "__main__":
    main()