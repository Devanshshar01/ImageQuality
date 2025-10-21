#!/bin/bash

# AI Image Quality Enhancer Setup Script
echo "🚀 Setting up AI Image Quality Enhancer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
if [ "$(echo "$PYTHON_VERSION < 3.8" | bc -l)" -eq 1 ]; then
    echo "❌ Python 3.8+ is required. Current version: $PYTHON_VERSION"
    exit 1
fi

echo "✅ Node.js $(node -v) and Python $PYTHON_VERSION detected"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found in backend directory"
    exit 1
fi

pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p temp
mkdir -p models
mkdir -p uploads
mkdir -p outputs

echo "✅ Directories created"

# Download AI models
echo "🤖 Downloading AI models..."
python3 download_models.py
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to download some models. You may need to download them manually."
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 AI Image Quality Enhancer is ready!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && python3 main.py"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For GPU acceleration, make sure you have CUDA installed."