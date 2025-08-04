#!/bin/bash

# CVision Build Script
# This script builds all services for production

set -e

echo "🏗️  Building CVision services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to build a Docker service
build_service() {
    local service=$1
    local context=$2
    local dockerfile=$3
    
    print_status "Building $service..."
    
    if docker build -t cvision-$service:latest -f $dockerfile $context; then
        print_success "$service built successfully"
        
        # Tag with current date for versioning
        local tag=$(date +%Y%m%d-%H%M%S)
        docker tag cvision-$service:latest cvision-$service:$tag
        print_status "Tagged $service as $tag"
    else
        print_error "Failed to build $service"
        exit 1
    fi
}

# Build all services
print_status "Starting build process..."

# Build backend
build_service "backend" "./cvision-backend" "./cvision-backend/Dockerfile"

# Build frontend
build_service "frontend" "./cvision-frontend" "./cvision-frontend/Dockerfile"

# Build analysis service
build_service "analysis-service" "./cvision-analysis-service-backend" "./cvision-analysis-service-backend/Dockerfile"

print_success "All services built successfully!"

echo ""
echo "🎉 Build completed!"
echo ""
echo "Built images:"
docker images | grep cvision-
echo ""
echo "Next steps:"
echo "1. Run: docker-compose up to start all services"
echo "2. Access the application at: http://localhost"
echo ""
echo "🔧 Useful commands:"
echo "   - Start services: docker-compose up -d"
echo "   - Stop services: docker-compose down"
echo "   - View logs: docker-compose logs -f"
echo "   - Clean up: docker system prune"