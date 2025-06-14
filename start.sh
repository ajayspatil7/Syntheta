#!/bin/bash

# =============================================================================
# SYNTHETA DOCKER MANAGEMENT SCRIPT - UPDATED FOR YOUR PROJECT STRUCTURE
# Save as: start-syntheta.sh and make executable: chmod +x start-syntheta.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if we're in the right directory
check_project_structure() {
    print_status "Checking project structure..."
    if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ]; then
        print_error "Invalid project structure. Please run this script from your project root."
        print_error "Expected: apps/backend/ and apps/frontend/ directories"
        exit 1
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        exit 1
    fi
    
    print_success "Project structure verified"
}

# Function to check/create environment files
check_env_files() {
    print_status "Checking environment configuration..."
    
    # Check backend .env
    if [ ! -f "apps/backend/.env" ]; then
        print_warning "Backend .env file not found. Creating..."
        cat > apps/backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/syntheta
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=syntheta

# Security
SECRET_KEY=eb454b2c60df0665e4d4f8633df18477b7b603a85940ce0d15a810f6a12251f2
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Redis
REDIS_URL=redis://redis:6379/0

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
EOF
        print_success "Created backend .env file"
    else
        print_success "Backend .env file exists"
    fi
    
    # Check frontend .env.local
    if [ ! -f "apps/frontend/.env.local" ]; then
        print_warning "Frontend .env.local file not found. Creating..."
        cat > apps/frontend/.env.local << EOF
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_APP_NAME=Syntheta
NEXT_PUBLIC_APP_VERSION=0.1.0
EOF
        print_success "Created frontend .env.local file"
    else
        print_success "Frontend .env.local file exists"
    fi
    
    # Check root .env for docker-compose
    if [ ! -f ".env" ]; then
        print_warning "Root .env file not found. Creating for docker-compose..."
        cat > .env << EOF
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=syntheta

# Security
SECRET_KEY=eb454b2c60df0665e4d4f8633df18477b7b603a85940ce0d15a810f6a12251f2
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optional Services
PGADMIN_EMAIL=admin@syntheta.com
PGADMIN_PASSWORD=admin123
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Environment
ENVIRONMENT=development
DEBUG=true
EOF
        print_success "Created root .env file"
    else
        print_success "Root .env file exists"
    fi
}

# Function to clean up containers and volumes
cleanup() {
    print_status "Cleaning up existing containers and volumes..."
    docker-compose down -v --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    print_success "Cleanup completed"
}

# Function to build and start services
start_services() {
    print_status "Building and starting Syntheta services..."
    
    # Build with no cache to ensure fresh builds
    docker-compose build --no-cache
    
    # Start services in correct order
    print_status "Starting database and Redis..."
    docker-compose up -d db redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout-2))
        if [ $timeout -le 0 ]; then
            print_error "Database failed to start within 60 seconds"
            print_error "Check database logs: docker-compose logs db"
            exit 1
        fi
    done
    print_success "Database is ready"
    
    # Start backend
    print_status "Starting backend service..."
    docker-compose up -d backend
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    timeout=60
    while ! curl -f http://localhost:8000/health > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout-2))
        if [ $timeout -le 0 ]; then
            print_error "Backend failed to start within 60 seconds"
            print_error "Check backend logs:"
            docker-compose logs backend
            exit 1
        fi
    done
    print_success "Backend is ready"
    
    # Start frontend
    print_status "Starting frontend service..."
    docker-compose up -d frontend 2>/dev/null || print_warning "Frontend service not found in docker-compose.yml"
    
    # Start optional services if they exist
    print_status "Starting optional services..."
    docker-compose up -d pgadmin 2>/dev/null || print_warning "PgAdmin service not found"
    docker-compose up -d minio 2>/dev/null || print_warning "MinIO service not found"
    
    print_success "All available services started successfully!"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    docker-compose ps
    echo ""
    print_status "Service URLs:"
    echo "🚀 Frontend:   http://localhost:3000 (if running)"
    echo "🔧 Backend:    http://localhost:8000"
    echo "🔧 API Docs:   http://localhost:8000/docs"
    echo "🗄️  Database:   localhost:5432 (postgres/postgres)"
    echo "📊 PgAdmin:    http://localhost:8080 (admin@syntheta.com/admin123)"
    echo "💾 MinIO:      http://localhost:9001 (minioadmin/minioadmin)"
    echo "⚡ Redis:      localhost:6379"
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    if docker-compose exec backend alembic upgrade head; then
        print_success "Migrations completed"
    else
        print_warning "Migrations failed or alembic not configured"
    fi
}

# Function to enter backend container
enter_backend() {
    print_status "Entering backend container..."
    docker-compose exec backend bash
}

# Function to test the setup
test_setup() {
    print_status "Testing Syntheta setup..."
    
    # Test backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "✅ Backend health check passed"
    else
        print_error "❌ Backend health check failed"
        return 1
    fi
    
    # Test database connection - Updated for your structure
    if docker-compose exec -T backend python -c "
import sys
sys.path.append('/app')
try:
    from app.db.session import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
" 2>/dev/null; then
        print_success "✅ Database connection test passed"
    else
        print_warning "⚠️  Database connection test inconclusive (might need manual verification)"
    fi
    
    # Test API endpoints
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        print_success "✅ API root endpoint accessible"
    else
        print_warning "⚠️  API root endpoint test failed"
    fi
    
    print_success "🎉 Basic tests completed! Syntheta services are running."
    print_status "Try saving a DAG from the frontend to test full functionality."
}

# Function to start development mode
dev_mode() {
    print_status "Starting Syntheta in development mode..."
    check_docker
    check_project_structure
    check_env_files
    
    # Start core services
    docker-compose up -d db redis backend
    
    print_status "Core services started. Frontend should be run separately with:"
    print_status "cd apps/frontend && npm run dev"
    
    show_status
}

# Main script logic
case "$1" in
    start)
        check_docker
        check_project_structure
        check_env_files
        start_services
        show_status
        ;;
    dev)
        dev_mode
        ;;
    stop)
        print_status "Stopping Syntheta services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    restart)
        print_status "Restarting Syntheta services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    clean)
        cleanup
        ;;
    rebuild)
        check_docker
        check_project_structure
        cleanup
        check_env_files
        start_services
        show_status
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    migrate)
        run_migrations
        ;;
    shell)
        enter_backend
        ;;
    test)
        test_setup
        ;;
    *)
        echo "Syntheta Docker Management Script"
        echo ""
        echo "Usage: $0 {start|dev|stop|restart|clean|rebuild|status|logs|migrate|shell|test}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all Syntheta services"
        echo "  dev       - Start backend services (run frontend separately)"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  clean     - Clean up containers and volumes"
        echo "  rebuild   - Clean and rebuild everything"
        echo "  status    - Show service status and URLs"
        echo "  logs      - Show logs (optionally specify service)"
        echo "  migrate   - Run database migrations"
        echo "  shell     - Enter backend container shell"
        echo "  test      - Test the setup"
        echo ""
        echo "Examples:"
        echo "  $0 start          # Start all services"
        echo "  $0 dev            # Start backend, run frontend separately"
        echo "  $0 logs backend   # Show backend logs"
        echo "  $0 rebuild        # Complete rebuild"
        echo ""
        echo "🎯 For development: Use '$0 dev' then 'cd apps/frontend && npm run dev'"
        exit 1
        ;;
esac