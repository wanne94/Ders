#!/bin/bash

# DERS.BA Deployment Tool
# Usage: ./deploy.sh [command]

echo ""
echo "================================"
echo "  DERS.BA Deployment Tool"
echo "================================"
echo ""

case "$1" in
  "web")
    echo "Deploying web aplikacija..."
    npm run deploy:web
    ;;
  "server")
    echo "Deploying server aplikacija..."
    npm run deploy:server
    ;;
  "health")
    echo "Checking application health..."
    npm run health
    ;;
  "help"|"-h"|"--help")
    echo "Usage:"
    echo "  ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  (none)     Deploy both web and server"
    echo "  web        Deploy only web application"
    echo "  server     Deploy only server application"
    echo "  health     Check application health"
    echo "  help       Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh"
    echo "  ./deploy.sh web"
    echo "  ./deploy.sh server"
    echo "  ./deploy.sh health"
    ;;
  "")
    echo "Deploying both web and server..."
    npm run deploy
    ;;
  *)
    echo "Unknown command: $1"
    echo "Use './deploy.sh help' for usage information."
    exit 1
    ;;
esac

echo ""
echo "Done!" 