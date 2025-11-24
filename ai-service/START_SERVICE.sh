#!/bin/bash
# Script để start Python AI Service

cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your DATABASE_URL."
        exit 1
    else
        echo "❌ .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

echo "🚀 Starting ReliefLink AI Service..."
echo "📍 Service will be available at: http://localhost:8000"
echo "📚 API docs: http://localhost:8000/docs"
echo ""

# Run the service
python main.py

