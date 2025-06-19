# 🚀 DERS.BA Production Deployment Guide
## Server: 194.163.176.171 → https://ders.ba

Ovo je kompletno uputstvo za deployment DERS.BA aplikacije na produkcijski server.

## 📋 Preduslovi

### 1. Server Specifikacije
- **IP**: 194.163.176.171
- **Domain**: ders.ba
- **OS**: Ubuntu/Debian Linux
- **Node.js**: v18+
- **MongoDB**: Instaliran i konfigurisan
- **Nginx**: Instaliran za reverse proxy
- **SSL**: Let's Encrypt certifikat

### 2. Potreban Software na Serveru
```bash
# Konektuj se na server
ssh root@194.163.176.171

# Update sistema
apt update && apt upgrade -y

# Node.js (ako nije instaliran)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# PM2 za process management
npm install -g pm2

# Nginx (ako nije instaliran)
apt-get install -y nginx

# Certbot za SSL (ako nije instaliran)
apt-get install -y certbot python3-certbot-nginx
```

## 🔧 Server Setup

### 1. Kreiranje Direktorija
```bash
# Na serveru
mkdir -p /var/www/ders/{web,server,logs}
chown -R www-data:www-data /var/www/ders
chmod -R 755 /var/www/ders
```

### 2. SSL Certifikat (Let's Encrypt)
```bash
# Dobij SSL certifikat
certbot --nginx -d ders.ba -d www.ders.ba

# Automatska obnova
crontab -e
# Dodaj liniju:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Nginx Konfiguracija
```bash
# Kopiraj nginx-production.conf na server
scp nginx-production.conf root@194.163.176.171:/etc/nginx/sites-available/ders.ba

# Aktiviraj konfiguraciju
ln -sf /etc/nginx/sites-available/ders.ba /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test konfiguracije
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## 🚀 Deployment Process

### Korak 1: Lokalna Priprema
```bash
# U lokalnom projektu
cd /home/avdo/predavanje

# Provjeri da li je sve build-ovano
npm run build

# Test lokalno
npm run dev
```

### Korak 2: Environment Konfiguracija

**Server .env fajl** (`server/.env.production`):
```env
NODE_ENV=production
PORT=5003
MONGODB_URI=mongodb://avdoAdmin:WanNeAvdo1994@194.163.176.171:27017/Predavanja?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-for-production
CORS_ORIGIN=https://ders.ba
```

**Web .env fajl** (`web/.env.production`):
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ders.ba/api
NEXT_PUBLIC_SERVER_URL=https://ders.ba
NEXT_PUBLIC_APP_URL=https://ders.ba
```

### Korak 3: Deployment Komande
```bash
# Deploy sve odjednom
npm run deploy

# Ili pojedinačno:
npm run deploy:server  # Backend
npm run deploy:web     # Frontend

# Provjeri status
npm run health
```

### Korak 4: PM2 Setup na Serveru
```bash
# SSH na server
ssh root@194.163.176.171

# Kopiraj PM2 konfiguraciju
cd /var/www/ders
# (ecosystem.config.js će biti uploadovan tokom deployment-a)

# Pokreni aplikacije
pm2 start ecosystem.config.js --env production

# Sačuvaj PM2 setup
pm2 save
pm2 startup

# Provjeri status
pm2 list
pm2 logs
```

## 📊 Monitoring i Maintenance

### PM2 Komande
```bash
# Status aplikacija
pm2 list

# Logovi
pm2 logs
pm2 logs ders-server
pm2 logs ders-web

# Restart aplikacija
pm2 restart ders-server
pm2 restart ders-web
pm2 restart all

# Stop aplikacija
pm2 stop ders-server
pm2 stop ders-web

# Monitoring dashboard
pm2 monit
```

### Nginx Komande
```bash
# Status
systemctl status nginx

# Restart
systemctl restart nginx

# Reload konfiguracije
systemctl reload nginx

# Test konfiguracije
nginx -t

# Logovi
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# API endpoint
curl -I https://ders.ba/api/health

# Web aplikacija
curl -I https://ders.ba

# Images
curl -I https://ders.ba/uploads/images/logo.jpg

# SSL certifikat
curl -I https://ders.ba | grep -i ssl
```

## 🔍 Troubleshooting

### Problem: Aplikacija ne startuje
```bash
# Provjeri PM2 logove
pm2 logs

# Provjeri environment varijable
pm2 show ders-server
pm2 show ders-web

# Restart aplikacija
pm2 restart all
```

### Problem: 502 Bad Gateway
```bash
# Provjeri da li aplikacije rade
pm2 list

# Provjeri portove
netstat -tlnp | grep :3000
netstat -tlnp | grep :5003

# Provjeri Nginx konfiguraciju
nginx -t
```

### Problem: SSL ne radi
```bash
# Provjeri certifikat
certbot certificates

# Obnovi certifikat
certbot renew --dry-run
certbot renew

# Restart Nginx
systemctl restart nginx
```

### Problem: Slike se ne učitavaju
```bash
# Provjeri da li Express server servira uploads
curl -I http://localhost:5003/uploads/images/logo.jpg

# Provjeri folder permissions
ls -la /var/www/ders/server/uploads/

# Provjeri Nginx proxy za uploads
curl -I https://ders.ba/uploads/images/logo.jpg
```

## 📈 Performance Optimizacije

### 1. PM2 Cluster Mode (opciono)
```javascript
// ecosystem.config.js - za više instance
{
  name: 'ders-server',
  script: './index.js',
  instances: 'max', // ili broj instance
  exec_mode: 'cluster'
}
```

### 2. Nginx Caching
```nginx
# Dodaj u nginx konfiguraciju
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g 
                 inactive=60m use_temp_path=off;

location / {
    proxy_cache my_cache;
    proxy_cache_revalidate on;
    proxy_cache_min_uses 3;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    # ... ostatak konfiguracije
}
```

### 3. MongoDB Optimizacije
```bash
# Kreiranje indexa za bolje performanse
mongo --eval "
db.lectures.createIndex({title: 'text', description: 'text'});
db.organizations.createIndex({name: 'text'});
db.users.createIndex({email: 1}, {unique: true});
"
```

## 🔐 Security Checklist

- [ ] SSL certifikat je aktivan i automatski se obnavlja
- [ ] Nginx security headers su podešeni
- [ ] JWT_SECRET je jak i jedinstven
- [ ] MongoDB pristup je ograničen na potrebne IP adrese
- [ ] PM2 procesi rade pod odgovarajućim korisničkim računom
- [ ] Firewall je konfigurisan (samo portovi 80, 443, 22)
- [ ] Regular backup MongoDB baze
- [ ] Log rotation je konfigurisan

## 📅 Maintenance Schedule

### Dnevno
- Provjeri PM2 status: `pm2 list`
- Provjeri disk space: `df -h`

### Nedeljno
- Provjeri logove: `pm2 logs --lines 100`
- Provjeri SSL certifikat: `certbot certificates`
- Backup MongoDB baze

### Mesečno
- Update sistema: `apt update && apt upgrade`
- Provjeri performance metrics
- Cleanup starih logova

## 🆘 Emergency Contacts

**Server Info:**
- IP: 194.163.176.171
- SSH Port: 22
- User: root

**Important Paths:**
- App: `/var/www/ders/`
- Logs: `/var/www/ders/logs/`
- Nginx: `/etc/nginx/sites-available/ders.ba`
- SSL: `/etc/letsencrypt/live/ders.ba/`

**Quick Recovery:**
```bash
# Restart sve
pm2 restart all
systemctl restart nginx

# Check status
pm2 list
systemctl status nginx
curl -I https://ders.ba
``` 