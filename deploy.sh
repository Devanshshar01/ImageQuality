#!/bin/bash

# AI Image Enhancer Deployment Script

set -e

echo "🚀 Deploying AI Image Quality Enhancer..."
echo "=========================================="

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=8000
NGINX_PORT=80
DOCKER_IMAGE="ai-image-enhancer"
DOCKER_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    local required_files=(
        "Dockerfile"
        "docker-compose.yml"
        "nginx.conf"
        "frontend/package.json"
        "backend/requirements.txt"
        "backend/main.py"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file not found: $file"
            exit 1
        fi
    done
    
    log_success "All required files found"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t ${DOCKER_IMAGE}-backend:${DOCKER_TAG} -f Dockerfile --target backend .
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t ${DOCKER_IMAGE}-frontend:${DOCKER_TAG} -f Dockerfile --target frontend .
    
    # Build production image
    log_info "Building production image..."
    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
    
    log_success "Docker images built successfully"
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Start services
    docker-compose up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Deploy with Docker directly
deploy_docker() {
    log_info "Deploying with Docker directly..."
    
    # Stop existing container
    docker stop ${DOCKER_IMAGE}-app 2>/dev/null || true
    docker rm ${DOCKER_IMAGE}-app 2>/dev/null || true
    
    # Run container
    docker run -d \
        --name ${DOCKER_IMAGE}-app \
        -p ${NGINX_PORT}:80 \
        -p ${BACKEND_PORT}:8000 \
        ${DOCKER_IMAGE}:${DOCKER_TAG}
    
    # Wait for container to be ready
    log_info "Waiting for container to start..."
    sleep 15
    
    # Check if container is running
    if docker ps | grep -q ${DOCKER_IMAGE}-app; then
        log_success "Container is running"
    else
        log_error "Container failed to start"
        docker logs ${DOCKER_IMAGE}-app
        exit 1
    fi
}

# Deploy to cloud (Vercel + Render)
deploy_cloud() {
    log_info "Deploying to cloud..."
    
    # Deploy frontend to Vercel
    if command -v vercel &> /dev/null; then
        log_info "Deploying frontend to Vercel..."
        cd frontend
        vercel --prod --yes
        cd ..
        log_success "Frontend deployed to Vercel"
    else
        log_warning "Vercel CLI not found. Please install it to deploy frontend."
    fi
    
    # Deploy backend to Render
    log_info "Backend deployment to Render requires manual setup:"
    echo "1. Create a new Web Service on Render"
    echo "2. Connect your GitHub repository"
    echo "3. Set build command: cd backend && pip install -r requirements.txt && python download_models.py"
    echo "4. Set start command: cd backend && python main.py"
    echo "5. Set environment variables:"
    echo "   - PYTHON_VERSION: 3.9"
    echo "   - PORT: 8000"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check frontend
    if curl -s -f http://localhost:${FRONTEND_PORT} > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_warning "Frontend is not accessible"
    fi
    
    # Check backend
    if curl -s -f http://localhost:${BACKEND_PORT}/health > /dev/null; then
        log_success "Backend is accessible"
    else
        log_warning "Backend is not accessible"
    fi
    
    # Check nginx
    if curl -s -f http://localhost:${NGINX_PORT} > /dev/null; then
        log_success "Nginx is accessible"
    else
        log_warning "Nginx is not accessible"
    fi
}

# Show deployment info
show_info() {
    log_info "Deployment completed!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost:${FRONTEND_PORT}"
    echo "   Backend API: http://localhost:${BACKEND_PORT}"
    echo "   API Docs: http://localhost:${BACKEND_PORT}/docs"
    echo "   Nginx: http://localhost:${NGINX_PORT}"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Update services: docker-compose pull && docker-compose up -d"
    echo ""
    echo "📊 Monitoring:"
    echo "   Container status: docker-compose ps"
    echo "   Resource usage: docker stats"
    echo "   Health check: curl http://localhost:${BACKEND_PORT}/health"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    docker-compose down 2>/dev/null || true
    docker stop ${DOCKER_IMAGE}-app 2>/dev/null || true
    docker rm ${DOCKER_IMAGE}-app 2>/dev/null || true
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    local deployment_type=${1:-"compose"}
    
    case $deployment_type in
        "compose")
            check_docker
            check_files
            build_images
            deploy_compose
            health_check
            show_info
            ;;
        "docker")
            check_docker
            check_files
            build_images
            deploy_docker
            health_check
            show_info
            ;;
        "cloud")
            deploy_cloud
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "Usage: $0 {compose|docker|cloud|cleanup}"
            echo ""
            echo "  compose  - Deploy using Docker Compose (default)"
            echo "  docker   - Deploy using Docker directly"
            echo "  cloud    - Deploy to cloud services"
            echo "  cleanup  - Clean up all containers and images"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup INT TERM

# Run main function
main "$@"