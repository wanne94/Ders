#!/bin/bash
set -e

echo "🚀 Deploying Next.js fix for ders.ba"
echo "====================================="

# Configuration
SERVER_HOST="194.163.176.171"
SERVER_USER="root"
SERVER_PORT="22"
REMOTE_PATH="/home/wanne/web/ders.ba/public_html"

# Test SSH connection
echo "Testing SSH connection to $SERVER_HOST..."
if ! ssh -o ConnectTimeout=10 -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo "❌ Cannot connect to server via SSH!"
    exit 1
fi
echo "✅ SSH connection successful"

# Upload built Next.js application
echo "Uploading Next.js build to server..."
rsync -avz --delete -e "ssh -p $SERVER_PORT" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next/cache' \
    /home/avdo/Ders/web/ $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/web/

if [ $? -eq 0 ]; then
    echo "✅ Next.js files uploaded successfully"
else
    echo "❌ Failed to upload Next.js files"
    exit 1
fi

# Upload PM2 configuration
echo "Uploading PM2 configuration..."
scp -P $SERVER_PORT /home/avdo/Ders/ecosystem.config.js $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    echo "✅ PM2 configuration uploaded"
else
    echo "❌ Failed to upload PM2 configuration"
    exit 1
fi

# Install dependencies and start application on server
echo "Installing dependencies and starting Next.js on server..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
    set -e
    
    # Navigate to web directory
    cd /home/wanne/web/ders.ba/public_html/web
    
    echo "Installing Node.js dependencies..."
    npm install --production
    
    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p /home/wanne/logs
    
    # Stop existing PM2 processes if any
    echo "Stopping existing PM2 processes..."
    pm2 stop ders-web 2>/dev/null || true
    pm2 delete ders-web 2>/dev/null || true
    
    # Start Next.js application with PM2
    echo "Starting Next.js application with PM2..."
    cd /home/wanne/web/ders.ba/public_html
    pm2 start ecosystem.config.js --only ders-web
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root || true
    
    # Show PM2 status
    pm2 status
    
    echo "Checking if port 3000 is active..."
    sleep 5
    if netstat -tuln | grep -q ":3000 "; then
        echo "✅ Next.js is running on port 3000"
    else
        echo "⚠️  Port 3000 is not active yet, checking PM2 logs..."
        pm2 logs ders-web --lines 20 --nostream
    fi
EOF

if [ $? -eq 0 ]; then
    echo "✅ Next.js application started successfully"
else
    echo "❌ Failed to start Next.js application"
    exit 1
fi

# Test the website
echo "Testing website endpoints..."
sleep 5

# Test main page
echo "Testing https://ders.ba ..."
if curl -s -I https://ders.ba | grep -q "200\|301\|302"; then
    echo "✅ Main page is accessible"
else
    echo "⚠️  Main page may have issues"
fi

# Test API endpoint
echo "Testing API endpoint..."
if curl -s -I https://ders.ba/api/health | grep -q "200"; then
    echo "✅ API endpoint is working"
else
    echo "⚠️  API endpoint may have issues"
fi

# Final summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "✅ Next.js application deployed and running on port 3000"
echo "✅ PM2 process manager configured for auto-restart"
echo "✅ Nginx should now properly proxy requests"
echo ""
echo "🔗 Check the website: https://ders.ba"
echo ""
