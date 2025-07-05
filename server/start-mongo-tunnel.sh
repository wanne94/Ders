#!/bin/bash

echo "Starting MongoDB SSH tunnel..."
echo "Password: WanNeAvdo1994"
ssh -L 27018:localhost:27017 root@194.163.176.171 -N