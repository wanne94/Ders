#!/bin/bash

# Trap CTRL+C signal and kill all child processes
trap 'kill $(jobs -p); exit' INT TERM

# Start all services
./start-tunnel.sh &
(cd server && npm run dev) &
(cd packages/web && npm run dev) &

# Wait for all background jobs
wait
