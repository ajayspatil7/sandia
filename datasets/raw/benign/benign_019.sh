#!/bin/bash
# Network connectivity monitor
HOSTS=("8.8.8.8" "google.com" "cloudflare.com")
LOG_FILE="/var/log/network_monitor.log"

echo "=== Network Monitor ===" | tee -a $LOG_FILE
echo "Check time: $(date)" | tee -a $LOG_FILE

for host in "${HOSTS[@]}"; do
    if ping -c 3 $host > /dev/null 2>&1; then
        echo "✓ $host is reachable" | tee -a $LOG_FILE
    else
        echo "✗ $host is NOT reachable" | tee -a $LOG_FILE
    fi
done

# Check port availability
if nc -zv localhost 80 > /dev/null 2>&1; then
    echo "✓ Port 80 is open" | tee -a $LOG_FILE
else
    echo "✗ Port 80 is closed" | tee -a $LOG_FILE
fi

echo "Monitor check complete" | tee -a $LOG_FILE
