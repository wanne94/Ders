#!/bin/bash

# Password za SSH pristup
export SSHPASS="WanNeAvdo1994"

# Server detalji
DEPLOY_HOST="194.163.176.171"
DEPLOY_USER="root"
DEPLOY_PORT="22"
DEPLOY_PATH="/var/www/ders.ba"

echo "🚀 Starting deployment with password authentication..."

# Build web aplikacije
echo "📦 Building web application..."
cd packages/web && npm run build
cd ../..

# Deploy web aplikacije
echo "🚀 Deploying web to server..."
sshpass -e rsync -avz --exclude 'node_modules' --exclude '.env.local' -e "ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no" packages/web/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/web/

# Instaliraj dependencies na serveru
echo "📦 Installing dependencies on server..."
sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/web && npm install --production"

# Restartuj aplikaciju
echo "🔄 Restarting web application..."
sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/web && pm2 restart ders-web || pm2 start npm --name ders-web -- start"

echo "✅ Deployment complete!"
