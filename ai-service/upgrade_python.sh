#!/bin/bash
# Script để upgrade Python và setup lại environment

echo "🔍 Checking Python version..."
python3 --version

echo ""
echo "📦 Installing Python 3.9.18 with pyenv..."
pyenv install 3.9.18

echo ""
echo "🔧 Setting local Python version..."
pyenv local 3.9.18

echo ""
echo "🗑️ Removing old venv..."
rm -rf venv

echo ""
echo "✅ Creating new virtual environment..."
python3 -m venv venv

echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate

echo ""
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

echo ""
echo "📥 Installing dependencies..."
pip install -r requirements-py39.txt

echo ""
echo "✅ Done! Activate venv with: source venv/bin/activate"
echo "🚀 Run service with: python main.py"

