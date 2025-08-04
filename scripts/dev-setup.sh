#!/bin/bash

# CVision Development Setup Script
# This script sets up the development environment for CVision

set -e

echo "🚀 Setting up CVision development environment..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .NET SDK is installed
if ! command -v dotnet &> /dev/null; then
    print_warning ".NET SDK is not installed. Please install .NET 8.0 SDK for local development."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Please install Node.js 20.x for local development."
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed. Please install Python 3.11+ for local development."
fi

print_status "Setting up environment files..."

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    cp .env.development .env
    print_success "Created .env file from .env.development"
else
    print_warning ".env file already exists, skipping..."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads/cvfiles
mkdir -p nginx/ssl

print_status "Setting up development database..."

# Start development services (database and cache only)
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Check if database is accessible
if docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres -d cvisiondb_dev; then
    print_success "Database is ready!"
else
    print_error "Database is not ready. Please check the logs."
    exit 1
fi

print_status "Setting up backend..."

# Navigate to backend directory and restore packages
if [ -d "cvision-backend" ]; then
    cd cvision-backend
    if command -v dotnet &> /dev/null; then
        dotnet restore
        print_success "Backend packages restored"
        
        # Run database migrations
        print_status "Running database migrations..."
        dotnet ef database update --project Infrastructure/CVisionBackend.Persistence --startup-project Presentation/CVisionBackend.API
        print_success "Database migrations completed"
    else
        print_warning "Skipping backend setup - .NET SDK not found"
    fi
    cd ..
fi

print_status "Setting up frontend..."

# Navigate to frontend directory and install packages
if [ -d "cvision-frontend" ]; then
    cd cvision-frontend
    if command -v npm &> /dev/null; then
        npm install
        print_success "Frontend packages installed"
    else
        print_warning "Skipping frontend setup - Node.js not found"
    fi
    cd ..
fi

print_status "Setting up analysis service..."

# Navigate to analysis service directory and install packages
if [ -d "cvision-analysis-service-backend" ]; then
    cd cvision-analysis-service-backend
    if command -v python3 &> /dev/null; then
        # Create virtual environment if it doesn't exist
        if [ ! -d "venv" ]; then
            python3 -m venv venv
            print_success "Created Python virtual environment"
        fi
        
        # Activate virtual environment and install packages
        source venv/bin/activate
        pip install -r requirements.txt
        python -m spacy download en_core_web_sm
        print_success "Analysis service packages installed"
        deactivate
    else
        print_warning "Skipping analysis service setup - Python not found"
    fi
    cd ..
fi

print_success "Development environment setup completed!"

echo ""
echo "🎉 CVision development environment is ready!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in .env file"
echo "2. Start the development services:"
echo "   - Full stack: docker-compose up"
echo "   - Dev services only: docker-compose -f docker-compose.dev.yml up"
echo "3. For local development:"
echo "   - Backend: cd cvision-backend && dotnet run --project Presentation/CVisionBackend.API"
echo "   - Frontend: cd cvision-frontend && npm run dev"
echo "   - Analysis Service: cd cvision-analysis-service-backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "🔧 Useful commands:"
echo "   - Stop services: docker-compose down"
echo "   - View logs: docker-compose logs -f [service-name]"
echo "   - Access database: docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d cvisiondb_dev"
echo "   - Access PgAdmin: http://localhost:5050 (admin@cvision.com / admin123)"
echo "   - Access Redis Commander: http://localhost:8081"
echo ""
echo "📚 Documentation: Check README.md for more information"