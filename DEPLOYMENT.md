# 🚀 DERS.BA Automatic Deployment

Automatski deployment sistem za DERS.BA aplikaciju na VPS server.

## 📋 Preduslovi

### 1. SSH pristup serveru
```bash
# Generiraj SSH ključ ako ga nemaš
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Kopiraj javni ključ na server
ssh-copy-id username@your-server-ip
```

### 2. Server priprema
Na serveru instaliraj:
```bash
# Node.js (preporučeno v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
sudo apt-get install -y mongodb

# PM2 (opciono, za production)
sudo npm install -g pm2

# Nginx (za reverse proxy)
sudo apt-get install -y nginx
```

## ⚙️ Konfiguracija

### 1. Uredi `deploy.js` konfiguraciju:

```javascript
const CONFIG = {
  server: {
    host: '192.168.1.100',           // Tvoja server IP adresa
    username: 'root',                // SSH username
    port: 22,                        // SSH port
    deployPath: '/var/www/ders',     // Gdje će se app deployovati
    domain: 'ders.ba'                // Tvoj domain
  }
};
```

### 2. Provjeri SSH konekciju:
```bash
ssh username@your-server-ip
```

## 🚀 Deployment komande

### Prvi put (full deployment):
```bash
npm run deploy
```

### Brži deployment (samo promjene):
```bash
npm run deploy:quick
```

### Ručni deployment preparation:
```bash
npm run deploy:prepare
```

## 📁 Šta se deployuje

### Automatski se kopiraju:
- ✅ `web/` - Next.js aplikacija (built)
- ✅ `server/` - Node.js/Express server
- ✅ `shared/` - Shared utilities (built)
- ✅ Deployment skripte (`start.sh`, `stop.sh`)
- ✅ Environment template fajlovi

### Ne kopiraju se:
- ❌ `node_modules/` (instaliraju se na serveru)
- ❌ `.git/`
- ❌ Development fajlovi

## 🔧 Server konfiguracija

### Environment varijable

**Server (.env):**
```env
NODE_ENV=production
PORT=5003
MONGODB_URI=mongodb://localhost:27017/ders_production
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://ders.ba
```

**Web (.env.production):**
```env
NEXT_PUBLIC_API_URL=http://ders.ba
NODE_ENV=production
PORT=3000
```

### Nginx konfiguracija (opciono)

```nginx
# /etc/nginx/sites-available/ders.ba
server {
    listen 80;
    server_name ders.ba www.ders.ba;

    # Web aplikacija
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/ders/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Aktiviraj konfiguraciju:
```bash
sudo ln -s /etc/nginx/sites-available/ders.ba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Monitoring i debugging

### Provjeri status aplikacije:
```bash
# Na serveru
cd /var/www/ders

# Provjeri logove
tail -f logs/server.log
tail -f logs/web.log

# Provjeri procese
ps aux | grep node

# Restart aplikacije
./stop.sh
./start.sh
```

### Testiranje:
```bash
# API health check
curl http://ders.ba/api/health

# Web aplikacija
curl http://ders.ba
```

## 🛠️ Troubleshooting

### Problem: "Permission denied"
```bash
# Na serveru, dodaj execute permissions
chmod +x /var/www/ders/start.sh
chmod +x /var/www/ders/stop.sh
```

### Problem: "Port already in use"
```bash
# Pronađi i zaustavi proces
sudo lsof -i :3000
sudo lsof -i :5003
kill -9 PID_NUMBER
```

### Problem: "Module not found"
```bash
# Reinstaliraj dependencies na serveru
cd /var/www/ders/server && npm install --production
cd /var/www/ders/web && npm install --production
cd /var/www/ders/shared && npm install --production
```

### Problem: Database konekcija
```bash
# Provjeri MongoDB status
sudo systemctl status mongodb
sudo systemctl start mongodb

# Provjeri konekciju
mongo --eval "db.adminCommand('ismaster')"
```

## 📊 Production optimizacije

### PM2 setup (preporučeno):
```bash
# Na serveru
npm install -g pm2

# Kreiraj PM2 ecosystem file
# /var/www/ders/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ders-server',
      script: './server/index.js',
      cwd: '/var/www/ders',
      env: {
        NODE_ENV: 'production',
        PORT: 5003
      }
    },
    {
      name: 'ders-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ders/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};

# Pokreni sa PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### SSL Certificate (Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ders.ba -d www.ders.ba
```

## 🔄 Workflow

### Development → Production:
1. **Razvoj** - radi lokalno sa `npm run dev`
2. **Test** - testiraj promjene
3. **Commit** - commit u git
4. **Deploy** - pokreni `npm run deploy`
5. **Verify** - provjeri da li radi na production

### Brze promjene:
1. Napravi manje promjene
2. Pokreni `npm run deploy:quick`
3. Provjeri rezultat

## 📞 Support

Ako imaš problema sa deployment-om:

1. Provjeri logove: `tail -f logs/server.log`
2. Provjeri network konekciju: `ping your-server-ip`
3. Provjeri SSH pristup: `ssh username@your-server-ip`
4. Provjeri server resources: `htop`, `df -h`

---

**Napravljen za DERS.BA projekt** 🕌 