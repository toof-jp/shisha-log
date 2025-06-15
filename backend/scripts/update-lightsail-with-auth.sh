#!/bin/bash

# Update script for Lightsail Docker container with authentication
# Usage: ./scripts/update-lightsail-with-auth.sh

set -e

echo "=== Lightsail Container Update Script (with Auth) ==="
echo "Started at: $(date)"
echo

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
elif [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
else
    echo "ERROR: .env file not found"
    exit 1
fi

if [ -z "$REGISTRY_USERNAME" ] || [ -z "$REGISTRY_PASSWORD" ]; then
    echo "ERROR: REGISTRY_USERNAME or REGISTRY_PASSWORD not set in .env"
    exit 1
fi

LIGHTSAIL_IP="35.75.202.209"

echo "1. Updating Lightsail container with provided credentials..."

# SSH to Lightsail and update using the registry credentials
ssh -o StrictHostKeyChecking=no ubuntu@$LIGHTSAIL_IP << EOF
cd /opt/shisha-log || { echo "ERROR: /opt/shisha-log directory not found"; exit 1; }

echo "Current container status..."
sudo docker-compose ps

echo "Logging into registry..."
echo "$REGISTRY_PASSWORD" | sudo docker login --username $REGISTRY_USERNAME --password-stdin public.ecr.aws

echo "Pulling latest image..."
sudo docker-compose pull

echo "Stopping current container..."
sudo docker-compose down

echo "Starting new container..."
sudo docker-compose up -d

echo "Waiting for container to be healthy..."
sleep 10

echo "Checking new container status..."
sudo docker-compose ps

echo "Testing backend health..."
if curl -f http://localhost:8080/health -o /dev/null -s; then
    echo "✓ Backend is responding on port 8080"
else
    echo "✗ Backend health check failed"
fi

echo "Cleaning up old images..."
sudo docker image prune -f

echo "Update completed!"
EOF

echo
echo "=== Update completed successfully! ==="
echo "Check the application at: https://api.shisha.toof.jp/api/v1/health"