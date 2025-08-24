#!/bin/bash

# SSH Tunnel script for MongoDB connection
# Forwards remote MongoDB (port 27017) to local port 27018

# Trap signals to properly cleanup SSH tunnel
cleanup() {
    echo "Stopping SSH tunnel..."
    if [ -f /tmp/ssh_tunnel.pid ]; then
        kill $(cat /tmp/ssh_tunnel.pid) 2>/dev/null
        rm /tmp/ssh_tunnel.pid
    fi
    exit 0
}

trap cleanup INT TERM EXIT

echo "Starting SSH tunnel for MongoDB..."

# Check if tunnel is already running
if lsof -Pi :27018 -sTCP:LISTEN -t >/dev/null ; then
    echo "SSH tunnel already running on port 27018"
    exit 0
fi

# Start SSH tunnel
ssh -N -L 27018:localhost:27017 root@194.163.176.171 -p 22 -i /home/avdo/.ssh/id_ed25519 &

# Save the PID
SSH_PID=$!
echo $SSH_PID > /tmp/ssh_tunnel.pid

echo "SSH tunnel started with PID: $SSH_PID"
echo "MongoDB available at: mongodb://127.0.0.1:27018"

# Keep the script running
wait $SSH_PID