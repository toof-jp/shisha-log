#!/bin/bash

# HTTPS Debug Script for Lightsail
# Usage: ssh ubuntu@<IP> 'bash -s' < scripts/debug-https.sh

echo "=== HTTPS/SSL Debugging for Lightsail ==="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo

echo "1. DNS Configuration Check..."
DOMAIN=$(grep "server_name" /etc/nginx/sites-available/shisha-log 2>/dev/null | awk '{print $2}' | sed 's/;//')
if [ -z "$DOMAIN" ]; then
    echo "⚠️  No domain found in Nginx config"
    DOMAIN="api.shisha.toof.jp"  # Default fallback
else
    echo "Domain configured: $DOMAIN"
fi

echo "Checking DNS resolution..."
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    echo "✅ DNS is correctly configured"
else
    echo "❌ DNS mismatch! Domain points to $DOMAIN_IP instead of $SERVER_IP"
fi
echo

echo "2. Port Status Check..."
echo "Checking if ports are open..."
sudo netstat -tlnp | grep -E ":80|:443|:8080"
echo

echo "Checking Lightsail firewall rules..."
if command -v aws &> /dev/null; then
    INSTANCE_NAME=$(curl -s http://169.254.169.254/latest/meta-data/tags/instance | grep -oP '(?<=Name=)[^,]*' || echo "unknown")
    if [ "$INSTANCE_NAME" != "unknown" ]; then
        echo "Instance name: $INSTANCE_NAME"
        aws lightsail get-instance-port-states --instance-name "$INSTANCE_NAME" 2>/dev/null || echo "Could not retrieve port states"
    fi
else
    echo "AWS CLI not available for firewall check"
fi
echo

echo "3. SSL Certificate Status..."
echo "Checking Let's Encrypt certificates..."
if [ -d /etc/letsencrypt/live ]; then
    sudo ls -la /etc/letsencrypt/live/
    echo
    echo "Certificate details:"
    sudo certbot certificates 2>/dev/null || echo "Certbot not configured"
else
    echo "❌ No Let's Encrypt certificates found"
fi
echo

echo "4. Nginx Configuration..."
echo "Nginx status:"
sudo systemctl status nginx --no-pager | head -10
echo

echo "Checking Nginx SSL configuration..."
if [ -f /etc/nginx/sites-available/shisha-log ]; then
    echo "Current Nginx config:"
    sudo cat /etc/nginx/sites-available/shisha-log
    echo
    echo "SSL-related configuration:"
    sudo grep -n -E "listen.*443|ssl_|server_name" /etc/nginx/sites-available/shisha-log || echo "No SSL configuration found"
else
    echo "❌ Nginx site configuration not found"
fi
echo

echo "Testing Nginx configuration..."
sudo nginx -t
echo

echo "5. SSL Automation Status..."
echo "Checking SSL automation timer..."
sudo systemctl status setup-ssl.timer --no-pager 2>/dev/null || echo "SSL timer not found"
echo

echo "Checking SSL setup service..."
sudo systemctl status setup-ssl.service --no-pager 2>/dev/null || echo "SSL service not found"
echo

echo "SSL setup script location:"
if [ -f /opt/shisha-log/setup-ssl.sh ]; then
    ls -la /opt/shisha-log/setup-ssl.sh
    echo "Script exists"
else
    echo "❌ SSL setup script not found"
fi
echo

echo "6. Recent SSL Setup Logs..."
echo "Checking systemd logs for SSL setup..."
sudo journalctl -u setup-ssl.service --no-pager -n 30 2>/dev/null || echo "No SSL setup logs found"
echo

echo "7. Testing HTTPS Access..."
echo "Testing HTTP access:"
curl -I http://localhost:80 2>&1 | head -5
echo

echo "Testing HTTPS access (if available):"
curl -kI https://localhost:443 2>&1 | head -5
echo

echo "8. Quick Fix Suggestions..."
echo "----------------------------------------"
if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "🔧 DNS Issue detected. Please update DNS A record:"
    echo "   $DOMAIN -> $SERVER_IP"
    echo
fi

if ! sudo grep -q "listen.*443" /etc/nginx/sites-available/shisha-log 2>/dev/null; then
    echo "🔧 No HTTPS configuration in Nginx. To obtain SSL certificate:"
    echo "   sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"
    echo
fi

if [ -f /opt/shisha-log/setup-ssl.sh ]; then
    echo "🔧 To manually run SSL setup:"
    echo "   sudo /opt/shisha-log/setup-ssl.sh"
    echo
fi

echo "🔧 To add temporary self-signed certificate:"
echo "   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
echo "     -keyout /etc/ssl/private/nginx-selfsigned.key \\"
echo "     -out /etc/ssl/certs/nginx-selfsigned.crt \\"
echo "     -subj \"/C=JP/ST=Tokyo/L=Tokyo/O=Test/CN=$DOMAIN\""
echo

echo "🔧 To check application logs:"
echo "   cd /opt/shisha-log && sudo docker-compose logs"
echo

echo "=== End of HTTPS Debug Report ===">