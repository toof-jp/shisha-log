#!/bin/bash
# BuyPass SSL Setup Script
# This script sets up SSL certificates using BuyPass Go SSL instead of Let's Encrypt

set -e

DOMAIN="${SSL_DOMAIN:-api.shisha.toof.jp}"
EMAIL="${SSL_EMAIL:-admin@${DOMAIN}}"

echo "Starting BuyPass SSL certificate setup for $DOMAIN"

# Function to check if domain resolves to this server
check_dns() {
    SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
    
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        return 0
    else
        return 1
    fi
}

# Check DNS
echo "Checking DNS configuration..."
if check_dns; then
    echo "✅ DNS is properly configured!"
    echo "Server IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "Domain IP: $(dig +short $DOMAIN | tail -n1)"
else
    echo "⚠️  Warning: DNS may not be properly configured"
    echo "Server IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "Domain IP: $(dig +short $DOMAIN | tail -n1)"
    echo "Proceeding anyway..."
fi

# Obtain SSL certificate from BuyPass
echo ""
echo "Obtaining SSL certificate from BuyPass..."
echo "Using email: $EMAIL"

# Run certbot with BuyPass ACME server
sudo certbot --nginx \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --server 'https://api.buypass.com/acme/directory'

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully from BuyPass!"
    
    # Update cron job for renewal
    echo "Setting up automatic renewal..."
    (sudo crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 2 * * * /usr/bin/certbot renew --quiet --server 'https://api.buypass.com/acme/directory' && /bin/systemctl reload nginx") | sudo crontab -
    
    # Test HTTPS
    echo ""
    echo "Testing HTTPS configuration..."
    sleep 5
    if curl -sSf https://$DOMAIN/health > /dev/null 2>&1; then
        echo "✅ HTTPS is working correctly!"
        echo ""
        echo "Your site is now accessible at: https://$DOMAIN"
    else
        echo "⚠️  HTTPS test failed, but certificate was installed."
        echo "Please check nginx configuration manually."
    fi
    
    # Show certificate info
    echo ""
    echo "Certificate information:"
    sudo certbot certificates
else
    echo ""
    echo "❌ Failed to obtain SSL certificate from BuyPass"
    echo "Please check the error messages above."
    exit 1
fi