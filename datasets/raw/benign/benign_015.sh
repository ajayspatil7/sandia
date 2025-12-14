#!/bin/bash
# Service health check script
SERVICES=("apache2" "mysql" "redis" "nodejs")

echo "=== Service Health Check ==="
echo "Checking at: $(date)"

for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✓ $service is running"
    else
        echo "✗ $service is NOT running"
        echo "Attempting to restart $service..."
        sudo systemctl restart $service

        if systemctl is-active --quiet $service; then
            echo "✓ $service restarted successfully"
        else
            echo "✗ Failed to restart $service"
        fi
    fi
done

echo "Health check complete"
