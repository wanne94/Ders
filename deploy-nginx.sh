#!/bin/bash

# DERS.BA Nginx Configuration Deployment
# Deploys nginx configuration to production server

set -e

echo "🚀 DERS.BA Nginx Configuration Deployment"
echo "=========================================="

# Configuration
SERVER_HOST="194.163.176.171"
SERVER_USER="root"
SERVER_PORT="22"
NGINX_CONFIG="nginx-production.conf"
REMOTE_CONFIG="/etc/nginx/sites-available/ders.ba"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if nginx config file exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo_error "Nginx configuration file '$NGINX_CONFIG' not found!"
    exit 1
fi

echo_info "Found nginx configuration: $NGINX_CONFIG"

# Test SSH connection
echo_info "Testing SSH connection to $SERVER_HOST..."
if ! ssh -o ConnectTimeout=10 -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo_error "Cannot connect to server via SSH!"
    echo "Please check:"
    echo "  - Server is accessible: $SERVER_HOST:$SERVER_PORT"
    echo "  - SSH key is configured"
    echo "  - User has access: $SERVER_USER"
    exit 1
fi

echo_success "SSH connection successful"

# Upload nginx configuration
echo_info "Uploading nginx configuration to server..."
if scp -P $SERVER_PORT "$NGINX_CONFIG" "$SERVER_USER@$SERVER_HOST:$REMOTE_CONFIG"; then
    echo_success "Nginx configuration uploaded"
else
    echo_error "Failed to upload nginx configuration"
    exit 1
fi

# Test nginx configuration on server
echo_info "Testing nginx configuration on server..."
if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "nginx -t"; then
    echo_success "Nginx configuration is valid"
else
    echo_error "Nginx configuration test failed!"
    echo_warning "Configuration was uploaded but has errors"
    exit 1
fi

# Enable the site
echo_info "Enabling site configuration..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Enable ders.ba site
    ln -sf /etc/nginx/sites-available/ders.ba /etc/nginx/sites-enabled/
    
    # Test configuration again
    nginx -t
"

if [ $? -eq 0 ]; then
    echo_success "Site configuration enabled"
else
    echo_error "Failed to enable site configuration"
    exit 1
fi

# Reload nginx
echo_info "Reloading nginx..."
if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "systemctl reload nginx"; then
    echo_success "Nginx reloaded successfully"
else
    echo_warning "Nginx reload failed, trying restart..."
    if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "systemctl restart nginx"; then
        echo_success "Nginx restarted successfully"
    else
        echo_error "Failed to restart nginx"
        exit 1
    fi
fi

# Check nginx status
echo_info "Checking nginx status..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "systemctl status nginx --no-pager -l"

# Test the website
echo_info "Testing website accessibility..."
sleep 2

# Test HTTP redirect
echo_info "Testing HTTP to HTTPS redirect..."
if curl -s -I -L http://ders.ba | grep -q "200 OK"; then
    echo_success "HTTP redirect working"
else
    echo_warning "HTTP redirect may not be working properly"
fi

# Test HTTPS
echo_info "Testing HTTPS..."
if curl -s -I https://ders.ba | grep -q "200 OK"; then
    echo_success "HTTPS working"
else
    echo_warning "HTTPS may not be working properly"
fi

# Test API endpoint
echo_info "Testing API endpoint..."
if curl -s -I https://ders.ba/api/health | grep -q "200 OK"; then
    echo_success "API endpoint working"
else
    echo_warning "API endpoint may not be working properly"
fi

# Final summary
echo ""
echo "🎉 Nginx Deployment Complete!"
echo "=============================="
echo ""
echo "✅ Configuration deployed: $REMOTE_CONFIG"
echo "✅ Nginx reloaded"
echo "✅ Site enabled: ders.ba"
echo ""
echo "🔗 Test URLs:"
echo "   • https://ders.ba"
echo "   • https://ders.ba/api/health"
echo "   • https://ders.ba/uploads/images/logo.jpg"
echo ""
echo "📊 Useful commands:"
echo "   • Check nginx status: systemctl status nginx"
echo "   • View nginx logs: tail -f /var/log/nginx/error.log"
echo "   • Test config: nginx -t"
echo "   • Reload nginx: systemctl reload nginx"
echo "" 