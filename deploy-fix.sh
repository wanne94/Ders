#!/bin/bash

# Deploy fix script za ders.ba
# Ova skripta će uploadovati popravke na server i restartovati servise

echo "🚀 Deploying fixes to ders.ba..."

# Server configuration
SERVER_IP="194.163.176.171"
SERVER_USER="root"
SSH_KEY="/home/avdo/.ssh/id_ed25519"

# Files to upload
FILES_TO_UPLOAD=(
    "ecosystem.config.js"
    "server/.env.production"
    "web/config/environment.js"
)

echo "📦 Uploading configuration files..."

# Upload ecosystem.config.js
scp -i $SSH_KEY ecosystem.config.js $SERVER_USER@$SERVER_IP:/root/ders.ba/

# Upload .env.production to server directory
scp -i $SSH_KEY server/.env.production $SERVER_USER@$SERVER_IP:/root/ders.ba/server/

# Upload environment.js to web directory
scp -i $SSH_KEY web/config/environment.js $SERVER_USER@$SERVER_IP:/root/ders.ba/web/config/

echo "✅ Files uploaded successfully"

echo "🔧 Connecting to server to restart services..."

# SSH to server and restart PM2
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'ENDSSH'
    echo "📍 Current location: $(pwd)"
    cd /root/ders.ba
    
    echo "🛑 Stopping PM2 processes..."
    pm2 stop all
    
    echo "🗑️ Deleting old PM2 processes..."
    pm2 delete all
    
    echo "📁 Creating logs directory if it doesn't exist..."
    mkdir -p /root/logs
    
    echo "🚀 Starting PM2 with new configuration..."
    pm2 start ecosystem.config.js
    
    echo "💾 Saving PM2 configuration..."
    pm2 save
    
    echo "🔄 Rebuilding Next.js application..."
    cd /root/ders.ba/web
    npm run build
    cd /root/ders.ba
    
    echo "🔄 Setting up PM2 startup..."
    pm2 startup systemd -u root --hp /root
    
    echo "📊 PM2 Status:"
    pm2 status
    
    echo "🔍 Checking API health..."
    sleep 5
    curl -s http://localhost:5003/api/health || echo "API health check failed"
    
    echo "📜 Recent PM2 logs:"
    pm2 logs --lines 10
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Please check https://ders.ba to verify the fix"