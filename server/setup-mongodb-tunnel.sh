#!/bin/bash

# MongoDB SSH Tunnel Setup for Development
echo "MongoDB SSH Tunnel Setup"
echo "========================"
echo ""
echo "This script will establish an SSH tunnel for MongoDB development."
echo "Local port 27018 will be forwarded to remote MongoDB port 27017"
echo ""

# Check if tunnel is already running
if lsof -i :27018 &> /dev/null; then
    echo "⚠️  Port 27018 is already in use. SSH tunnel might be already running."
    echo "   Run 'lsof -i :27018' to check what's using the port."
    exit 1
fi

echo "Starting SSH tunnel..."
echo "Remote server: root@194.163.176.171"
echo ""

# Use sshpass if available for automatic login
if command -v sshpass &> /dev/null; then
    echo "Using password: WanNeAvdo1994"
    sshpass -p 'WanNeAvdo1994' ssh -L 27018:localhost:27017 root@194.163.176.171 -N -o StrictHostKeyChecking=no
else
    echo "Password required: WanNeAvdo1994"
    ssh -L 27018:localhost:27017 root@194.163.176.171 -N
fi