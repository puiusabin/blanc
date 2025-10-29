#!/bin/bash
set -e

echo "Deploying mail service to production..."

# Check for required environment variables
if [ -z "$PRODUCTION_SERVER" ]; then
    echo "Error: PRODUCTION_SERVER environment variable is not set"
    exit 1
fi

# Build Docker images
echo "Building Docker images..."
cd docker
docker-compose -f docker-compose.prod.yml build

# Push to registry (if using Docker registry)
# docker-compose -f docker-compose.prod.yml push

# Deploy to server
echo "Deploying to $PRODUCTION_SERVER..."
# Add your deployment logic here
# Examples:
# - SSH to server and pull images
# - Use docker-compose on remote server
# - Use Kubernetes/Docker Swarm deployment

echo ""
echo "Deployment options:"
echo "1. SSH to server and run: docker-compose -f docker-compose.prod.yml up -d"
echo "2. Use CI/CD pipeline (see .github/workflows/)"
echo "3. Use container orchestration (Kubernetes, Docker Swarm, etc.)"
echo ""