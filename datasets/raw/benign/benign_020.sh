#!/bin/bash
# SSL certificate renewal script
DOMAIN="example.com"

echo "Checking SSL certificate for $DOMAIN..."

# Check expiry
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate)

echo "Current certificate: $EXPIRY_DATE"

# Renew with Let's Encrypt
echo "Attempting certificate renewal..."
sudo certbot renew --nginx

if [ $? -eq 0 ]; then
    echo "✓ Certificate renewed successfully"
    sudo systemctl reload nginx
else
    echo "✗ Certificate renewal failed"
    exit 1
fi
