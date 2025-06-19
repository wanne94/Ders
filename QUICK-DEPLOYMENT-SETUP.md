# 🚀 DERS.BA - Quick Deployment Setup
## Za https://ders.ba na serveru 194.163.176.171

Ovo je kratak vodič za brzu konfiguraciju i deployment na produkcijski server.

## ⚡ Quick Start (5 minuta)

### 1. Provjeri konfiguraciju
```bash
# Provjeri da li imaš SSH pristup
ssh root@194.163.176.171

# Provjeri da li postoji .env fajl
cat .env | grep DEPLOY_HOST
```

### 2. Deploy Nginx konfiguraciju
```bash
# Deploy optimizovanu nginx konfiguraciju
./deploy-nginx.sh
```

### 3. Deploy aplikaciju
```bash
# Deploy sve odjednom
npm run deploy

# Ili pojedinačno
npm run deploy:server
npm run deploy:web
```

### 4. Provjeri da li radi
```bash
# Health check
npm run health

# Ili direktno
curl -I https://ders.ba
curl -I https://ders.ba/api/health
```

## 📋 Šta će se desiti

### Nginx Deployment (`./deploy-nginx.sh`):
1. ✅ Upload `nginx-production.conf` → `/etc/nginx/sites-available/ders.ba`
2. ✅ Test nginx konfiguracije
3. ✅ Enable site (remove default)
4. ✅ Reload nginx
5. ✅ Test HTTPS i API endpoints

### App Deployment (`npm run deploy`):
1. ✅ Build web aplikacije
2. ✅ Upload server fajlova
3. ✅ Upload web build-a
4. ✅ Install dependencies na serveru
5. ✅ PM2 restart/start aplikacija
6. ✅ Health check

## 🔧 Server Setup (jednokratno)

Ako server nije pripremljen:

```bash
# SSH na server
ssh root@194.163.176.171

# Install potrebne pakete
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

# Kreiranje direktorija
mkdir -p /var/www/ders/{web,server,logs}
chown -R www-data:www-data /var/www/ders
chmod -R 755 /var/www/ders

# SSL certifikat (ako nije već kreiran)
certbot --nginx -d ders.ba -d www.ders.ba
```

## 🎯 Rezultat

Posle uspešnog deployment-a:

- **Web aplikacija**: https://ders.ba
- **API**: https://ders.ba/api/health
- **Slike**: https://ders.ba/uploads/images/logo.jpg
- **PM2 procesi**: `ders-web` i `ders-server`

## 🔍 Monitoring

```bash
# PM2 status
npm run monitor

# Logovi
npm run logs

# Nginx status
ssh root@194.163.176.171 "systemctl status nginx"
```

## 🆘 Troubleshooting

### Problem: SSH ne radi
```bash
# Test konekcije
ssh -v root@194.163.176.171

# Generiraj SSH key ako treba
ssh-keygen -t rsa -b 4096
ssh-copy-id root@194.163.176.171
```

### Problem: Nginx greška
```bash
# Test nginx konfiguracije
ssh root@194.163.176.171 "nginx -t"

# Provjeri logove
ssh root@194.163.176.171 "tail -f /var/log/nginx/error.log"
```

### Problem: Aplikacija ne radi
```bash
# Provjeri PM2
npm run health

# Restart aplikacija
ssh root@194.163.176.171 "pm2 restart all"
```

### Problem: SSL certifikat
```bash
# Provjeri certifikat
ssh root@194.163.176.171 "certbot certificates"

# Obnovi certifikat
ssh root@194.163.176.171 "certbot renew"
```

## 📁 Važni fajlovi

- `nginx-production.conf` - Optimizovana nginx konfiguracija
- `ecosystem.config.js` - PM2 konfiguracija
- `deploy-nginx.sh` - Nginx deployment skripta
- `deploy-complete.js` - App deployment skripta
- `PRODUCTION-DEPLOYMENT-GUIDE.md` - Detaljan vodič

## 🔄 Update Workflow

Za buduće izmene:

1. **Manje izmene**: `npm run deploy:web` ili `npm run deploy:server`
2. **Nginx izmene**: `./deploy-nginx.sh`
3. **Kompletno**: `npm run deploy`
4. **Provjera**: `npm run health`

---

**🎉 Za 5 minuta imaš https://ders.ba u produkciji!** 