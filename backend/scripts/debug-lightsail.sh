#!/bin/bash

# Debug script for Lightsail Docker issues
# Usage: ssh ubuntu@<IP> 'bash -s' < scripts/debug-lightsail.sh

echo "=== Lightsail Docker Debugging ==="
echo

echo "1. Checking Docker status..."
sudo docker version
echo

echo "2. Checking running containers..."
sudo docker ps -a
echo

echo "3. Checking Docker Compose..."
cd /opt/shisha-log 2>/dev/null || { echo "ERROR: /opt/shisha-log directory not found"; exit 1; }
if [ -f docker-compose.yml ]; then
    echo "Docker Compose file found:"
    cat docker-compose.yml
    echo
    echo "Docker Compose status:"
    sudo docker-compose ps
else
    echo "ERROR: docker-compose.yml not found"
fi
echo

echo "4. Checking environment variables..."
if [ -f .env ]; then
    echo "Environment file found. Container-related variables:"
    grep -E "(CONTAINER_|REGISTRY_|PORT)" .env | sed 's/=.*/=<HIDDEN>/'
else
    echo "ERROR: .env file not found"
fi
echo

echo "5. Checking ECR authentication..."
if command -v aws &> /dev/null; then
    echo "AWS CLI is installed"
    # Check if we can get ECR token
    if aws ecr-public get-login-password --region us-east-1 &> /dev/null; then
        echo "✓ ECR authentication successful"
    else
        echo "✗ ECR authentication failed"
        echo "  - Check IAM permissions"
        echo "  - Check AWS credentials"
    fi
else
    echo "ERROR: AWS CLI not installed"
fi
echo

echo "6. Checking Docker logs..."
if [ -f docker-compose.yml ]; then
    echo "Recent Docker Compose logs:"
    sudo docker-compose logs --tail=20
fi
echo

echo "7. Checking systemd service..."
if systemctl list-units --type=service | grep -q shisha-log; then
    echo "shisha-log service status:"
    sudo systemctl status shisha-log --no-pager
else
    echo "shisha-log service not found"
fi
echo

echo "8. Checking Nginx..."
echo "Nginx status:"
sudo systemctl status nginx --no-pager | head -5
echo "Nginx error log (last 10 lines):"
sudo tail -10 /var/log/nginx/error.log
echo

echo "9. Checking user-data execution..."
echo "Cloud-init status:"
cloud-init status
echo "Last 20 lines of cloud-init output:"
sudo tail -20 /var/log/cloud-init-output.log
echo

echo "=== Common Issues and Solutions ==="
echo "1. Image format issue: Ensure image path doesn't include 'public.ecr.aws/' twice"
echo "2. ECR auth: Instance needs IAM role or credentials with ecr-public:GetAuthorizationToken"
echo "3. Environment variables: Check if all required vars are in .env"
echo "4. Network: Ensure security group allows outbound HTTPS (443)"
echo

echo "=== Quick Fixes ==="
echo "To manually start the container:"
echo "  cd /opt/shisha-log"
echo "  sudo docker-compose pull"
echo "  sudo docker-compose up -d"
echo
echo "To check full logs:"
echo "  sudo journalctl -u shisha-log -f"