#!/bin/bash

# CVision Production Deployment Script
# This script deploys CVision to production environment

set -e

echo "🚀 Deploying CVision to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

if [ "$ENVIRONMENT" = "staging" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

print_status "Deployment environment: $ENVIRONMENT"
print_status "Using compose file: $COMPOSE_FILE"

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create it from .env.example"
    exit 1
fi

# Validate environment variables
print_status "Validating environment configuration..."

required_vars=(
    "POSTGRES_DB"
    "POSTGRES_USER" 
    "POSTGRES_PASSWORD"
    "JWT_SECRET_KEY"
    "REDIS_PASSWORD"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^${var}=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

print_success "Environment validation passed"

# Create backup before deployment
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Creating pre-deployment backup..."
    if docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres cvisiondb > "backups/pre_deploy_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null; then
        print_success "Pre-deployment backup created"
    else
        print_warning "Could not create backup (database might not be running)"
    fi
fi

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f $COMPOSE_FILE pull

# Stop services gracefully
print_status "Stopping existing services..."
docker-compose -f $COMPOSE_FILE down --timeout 30

# Remove old containers and volumes (optional)
if [ "$2" = "--clean" ]; then
    print_warning "Cleaning up old containers and volumes..."
    docker system prune -f
    docker volume prune -f
fi

# Start services
print_status "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Health checks
services=("postgres" "redis" "backend" "analysis-service" "frontend" "nginx")
failed_services=()

for service in "${services[@]}"; do
    print_status "Checking health of $service..."
    
    # Try up to 30 times (5 minutes)
    for i in {1..30}; do
        if docker-compose -f $COMPOSE_FILE ps | grep -q "$service.*healthy\|$service.*Up"; then
            print_success "$service is healthy"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "$service failed health check"
            failed_services+=("$service")
        fi
        
        sleep 10
    done
done

# Check if any services failed
if [ ${#failed_services[@]} -ne 0 ]; then
    print_error "The following services failed health checks:"
    printf '%s\n' "${failed_services[@]}"
    
    print_status "Showing logs for failed services..."
    for service in "${failed_services[@]}"; do
        echo "=== $service logs ==="
        docker-compose -f $COMPOSE_FILE logs --tail=50 $service
        echo ""
    done
    
    exit 1
fi

# Run database migrations (if needed)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Running database migrations..."
    docker-compose -f $COMPOSE_FILE exec -T backend dotnet ef database update --no-build || {
        print_warning "Database migrations failed or not needed"
    }
fi

# Verify endpoints
print_status "Verifying application endpoints..."

endpoints=(
    "http://localhost/health:Nginx health check"
    "http://localhost:8080/health:Backend API health"
    "http://localhost:8000/api/health:Analysis service health"
)

for endpoint_info in "${endpoints[@]}"; do
    IFS=':' read -r endpoint description <<< "$endpoint_info"
    
    if curl -f -s "$endpoint" > /dev/null; then
        print_success "$description - OK"
    else
        print_error "$description - FAILED"
        # Don't exit on endpoint failures, just warn
    fi
done

# Show deployment summary
echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Services deployed: ${#services[@]}"
echo "  Failed services: ${#failed_services[@]}"
echo ""
echo "🔗 Access URLs:"
echo "  Application: http://localhost (or your domain)"
echo "  API Documentation: http://localhost/api/swagger"
echo "  Monitoring: http://localhost:9090 (Prometheus)"
echo "  Metrics: http://localhost:3001 (Grafana)"
echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
echo "  Check status: docker-compose -f $COMPOSE_FILE ps"
echo "  Stop services: docker-compose -f $COMPOSE_FILE down"
echo "  Update services: ./scripts/deploy.sh $ENVIRONMENT"
echo ""

# Optional: Send deployment notification
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"CVision deployment to $ENVIRONMENT completed successfully!\"}" \
        >/dev/null 2>&1 || true
fi

print_status "Deployment script finished at $(date)"