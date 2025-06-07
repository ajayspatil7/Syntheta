#!/bin/bash
# setup_dev.sh - Local development setup for Syntheta

echo "🚀 Setting up Syntheta development environment..."

# Backend setup
echo "📦 Setting up backend..."
cd apps/backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Setup database
echo "🗄️ Setting up database..."
python3 app/db/init_db.py

echo "✅ Backend setup complete!"

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "🎯 To start development:"
echo "1. Backend: cd apps/backend && source venv/bin/activate && uvicorn main:app --reload"
echo "2. Frontend: cd apps/frontend && npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "📊 Database: Use TablePlus to connect to localhost:5432, database 'syntheta'"