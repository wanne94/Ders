#!/bin/bash

# SSH tunel za MongoDB development
echo "Starting SSH tunnel for MongoDB development..."
echo "You will need to enter the SSH password for root@194.163.176.171"
echo ""
echo "SSH tunnel will forward:"
echo "  Local port 27018 -> Remote MongoDB port 27017"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

ssh -L 27018:localhost:27017 root@194.163.176.171 -N