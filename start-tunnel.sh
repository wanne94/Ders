#!/bin/bash
echo "Povezivanje na MongoDB putem SSH tunela..."
ssh -f -N -L 27018:localhost:27017 root@194.163.176.171 \
  -o ServerAliveInterval=60 \
  -o ServerAliveCountMax=3
echo "✅ Tunel aktivan na localhost:27018"