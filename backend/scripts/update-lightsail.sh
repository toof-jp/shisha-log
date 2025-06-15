#!/bin/bash

# Update script for Lightsail Docker container
# Usage: ssh ubuntu@<IP> 'bash -s' < scripts/update-lightsail.sh

set -e

echo "=== Lightsail Container Update Script ==="
echo "Started at: $(date)"
echo

# Change to the application directory
cd /opt/shisha-log || { echo "ERROR: /opt/shisha-log directory not found"; exit 1; }

echo "1. Current container status..."
sudo docker-compose ps
echo

echo "2. Pulling latest image..."
# Get ECR login token
echo "   Authenticating with ECR..."
aws ecr-public get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin public.ecr.aws

# Pull the latest image
echo "   Pulling latest image..."
sudo docker-compose pull
echo

echo "3. Stopping current container..."
sudo docker-compose down
echo

echo "4. Starting new container..."
sudo docker-compose up -d
echo

echo "5. Waiting for container to be healthy..."
sleep 10

echo "6. Checking new container status..."
sudo docker-compose ps
echo

echo "7. Checking container logs..."
sudo docker-compose logs --tail=50
echo

echo "8. Testing backend health..."
# Test the health endpoint
if curl -f http://localhost:8080/health -o /dev/null -s; then
    echo "✓ Backend is responding on port 8080"
else
    echo "✗ Backend health check failed"
    echo "  Checking container logs for errors..."
    sudo docker-compose logs --tail=100
fi
echo

echo "9. Checking Nginx proxy..."
if curl -f http://localhost/api/v1/health -o /dev/null -s; then
    echo "✓ Nginx proxy is working correctly"
else
    echo "✗ Nginx proxy test failed"
    echo "  Checking Nginx error logs..."
    sudo tail -20 /var/log/nginx/error.log
fi
echo

echo "=== Update Summary ==="
echo "Container update completed at: $(date)"
echo "Current image:"
sudo docker-compose images
echo

echo "=== Post-Update Checklist ==="
echo "✓ Container pulled and restarted"
echo "✓ Health check performed"
echo "✓ Logs reviewed"
echo
echo "Next steps:"
echo "1. Test the API endpoints from your browser"
echo "2. Monitor logs: sudo docker-compose logs -f"
echo "3. If issues occur, rollback: sudo docker-compose down && sudo docker-compose up -d"
echo

# Clean up old images to save space
echo "10. Cleaning up old images..."
sudo docker image prune -f
echo

echo "=== Update completed successfully! ==="