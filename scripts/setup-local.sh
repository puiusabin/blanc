#!/bin/bash
set -e

echo "Setting up local development environment..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Install dependencies for web app
echo "Installing web app dependencies..."
cd apps/web
npm install
cd ../..

# Install dependencies for Haraka
echo "Installing Haraka dependencies..."
cd services/haraka
npm install
cd ../..

# Start Docker services
echo "Starting Docker services..."
cd docker
docker-compose up -d postgres
echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "Local environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with your configuration"
echo "2. Run 'docker-compose up' in the docker/ directory to start all services"
echo "3. Run 'npm run dev' in apps/web/ to start the Next.js app"
echo ""