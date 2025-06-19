#!/bin/bash

# DERS.BA HestiaCP Nginx Configuration Deployment (Simple)
# Modifies existing HestiaCP nginx.ssl.conf without creating duplicate files

set -e

echo "🚀 DERS.BA HestiaCP Nginx Configuration (Simple)"
echo "==============================================="

# Configuration
SERVER_HOST="194.163.176.171"
SERVER_USER="root"
SERVER_PORT="22"
HESTIA_CONFIG_DIR="/home/wanne/conf/web/ders.ba"

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

# Test SSH connection
echo_info "Testing SSH connection to $SERVER_HOST..."
if ! ssh -o ConnectTimeout=10 -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo_error "Cannot connect to server via SSH!"
    exit 1
fi

echo_success "SSH connection successful"

# Backup existing main configuration
echo_info "Creating backup of existing configuration..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
    cp $HESTIA_CONFIG_DIR/nginx.ssl.conf $HESTIA_CONFIG_DIR/nginx.ssl.conf.backup.$(date +%Y%m%d_%H%M%S)
"

# Create new nginx.ssl.conf with our modifications
echo_info "Creating new nginx configuration..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
cat > $HESTIA_CONFIG_DIR/nginx.ssl.conf << 'EOF'
#=========================================================================#
# Custom DERS.BA Configuration - Modified for Next.js + Express         #
# Based on HestiaCP template but customized for our application          #
#=========================================================================#

server {
        listen      194.163.176.171:443 ssl;
        server_name ders.ba www.ders.ba;
        root        /home/wanne/web/ders.ba/public_html;
        index       index.php index.html index.htm;
        access_log  /var/log/nginx/domains/ders.ba.log combined;
        access_log  /var/log/nginx/domains/ders.ba.bytes bytes;
        error_log   /var/log/nginx/domains/ders.ba.error.log error;

        ssl_certificate     /home/wanne/conf/web/ders.ba/ssl/ders.ba.pem;
        ssl_certificate_key /home/wanne/conf/web/ders.ba/ssl/ders.ba.key;
        ssl_stapling        on;
        ssl_stapling_verify on;

        # TLS 1.3 0-RTT anti-replay
        if (\$anti_replay = 307) { return 307 https://\$host\$request_uri; }
        if (\$anti_replay = 425) { return 425; }

        include /home/wanne/conf/web/ders.ba/nginx.hsts.conf*;

        location ~ /\.(?!well-known\/) {
                deny all;
                return 404;
        }

        # API routes - Express server
        location /api {
            proxy_pass http://127.0.0.1:5003;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            
            # API timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Uploads - served by Express server
        location /uploads {
            proxy_pass http://127.0.0.1:5003/uploads;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Cache images for 1 day
            proxy_cache_valid 200 1d;
            proxy_cache_bypass \$http_cache_control;
            add_header X-Proxy-Cache \$upstream_cache_status;
            
            # CORS for images
            add_header Access-Control-Allow-Origin \"*\";
            add_header Access-Control-Allow-Methods \"GET, HEAD, OPTIONS\";
            add_header Access-Control-Allow-Headers \"Origin, X-Requested-With, Content-Type, Accept\";
        }

        # Health check endpoint
        location /health {
            proxy_pass http://127.0.0.1:5003/health;
            access_log off;
        }

        # HestiaCP admin paths
        location /error/ {
                alias /home/wanne/web/ders.ba/document_errors/;
        }

        location /vstats/ {
                alias   /home/wanne/web/ders.ba/stats/;
                include /home/wanne/web/ders.ba/stats/auth.conf*;
        }

        # Main location - proxy everything else to Next.js
        location / {
            # Try Next.js first
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        proxy_hide_header Upgrade;

        include /etc/nginx/conf.d/phpmyadmin.inc*;
        include /etc/nginx/conf.d/phppgadmin.inc*;
        include /home/wanne/conf/web/ders.ba/nginx.ssl.conf_*;
}
EOF
"

if [ $? -eq 0 ]; then
    echo_success "Configuration created successfully"
else
    echo_error "Failed to create configuration"
    exit 1
fi

# Test nginx configuration
echo_info "Testing nginx configuration..."
if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "nginx -t"; then
    echo_success "Nginx configuration is valid"
else
    echo_error "Nginx configuration test failed!"
    echo_warning "Restoring backup..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
        cp $HESTIA_CONFIG_DIR/nginx.ssl.conf.backup.* $HESTIA_CONFIG_DIR/nginx.ssl.conf
    "
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

# Test the endpoints
echo_info "Testing endpoints..."
sleep 3

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

# Test uploads
echo_info "Testing uploads endpoint..."
if curl -s -I https://ders.ba/uploads/images/logo.jpg | grep -q "200 OK"; then
    echo_success "Uploads endpoint working"
else
    echo_warning "Uploads endpoint may not be working properly"
fi

# Final summary
echo ""
echo "🎉 HestiaCP Nginx Configuration Complete!"
echo "========================================"
echo ""
echo "✅ HestiaCP configuration modified for Next.js + Express"
echo "✅ API and uploads routes configured"
echo "✅ Nginx reloaded"
echo ""
echo "🔗 Test URLs:"
echo "   • https://ders.ba"
echo "   • https://ders.ba/api/health"
echo "   • https://ders.ba/uploads/images/logo.jpg"
echo ""
echo "📊 Configuration file: $HESTIA_CONFIG_DIR/nginx.ssl.conf"
echo "📊 Backup files: $HESTIA_CONFIG_DIR/nginx.ssl.conf.backup.*"
echo "" 