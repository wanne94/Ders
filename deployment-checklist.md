# 🚀 DERS.BA Deployment Checklist

## 📋 Pre-deployment priprema

### 1. Build aplikacije
```bash
# Iz root direktorija
npm run build
```

### 2. Test production build lokalno
```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Web (production mode)
cd web && npm start
```

## 📦 Fajlovi za upload na server

### 🌐 Web aplikacija
```
web/.next/              # ✅ Build output (obavezno)
web/public/             # ✅ Statički fajlovi
web/package.json        # ✅ Dependencies
web/package-lock.json   # ✅ Lock file
web/next.config.js      # ✅ Next.js config
```

### 🖥️ Server aplikacija
```
server/                 # ✅ Cijeli folder
├── index.js           # ✅ Glavni server
├── models/            # ✅ MongoDB modeli
├── routes/            # ✅ API rute
├── utils/             # ✅ Utility funkcije
├── package.json       # ✅ Dependencies
├── package-lock.json  # ✅ Lock file
└── scripts/           # ✅ Database scripts
```

### ⚙️ Environment fajlovi
```
server/.env            # ✅ Server environment
web/.env.production    # ✅ Web production env
```

## 🔧 Server setup komande

### 1. Install dependencies
```bash
# Server dependencies
cd server
npm install --production

# Web dependencies (ako treba)
cd ../web
npm install --production
```

### 2. Start aplikacije
```bash
# Server (production)
cd server
npm run prod

# Ili sa PM2 (preporučeno)
pm2 start index.js --name "ders-server"
```

## 🌍 Environment varijable (.env)

### Server (.env)
```env
NODE_ENV=production
PORT=5003
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-jwt-secret
```

### Web (.env.production)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

## 🔄 Nginx konfiguracija (ako koristite)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Next.js static files
    location /_next/static/ {
        alias /path/to/web/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests
    location /api/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Post-deployment provjera

1. **API Health Check:**
   ```
   GET https://yourdomain.com/api/health
   ```

2. **Web aplikacija:**
   ```
   https://yourdomain.com
   ```

3. **404 stranica:**
   ```
   https://yourdomain.com/nepostojeca-stranica
   ```

4. **Database konekcija:**
   - Provjeri server logs za MongoDB konekciju
   - Test API endpoints

## 🚨 Troubleshooting

### Česti problemi:
1. **Port conflicts** - Promijeni PORT u .env
2. **MongoDB konekcija** - Provjeri MONGODB_URI
3. **Static files** - Provjeri da li je .next folder uploadovan
4. **CORS errors** - Provjeri CORS konfiguraciju u server/index.js

### Logs:
```bash
# Server logs
pm2 logs ders-server

# Ili direktno
cd server && npm run prod
```

## 📱 Mobile app konfiguracija

Ako deployate i mobile app, update:
```javascript
// mobile/src/config/api.js
const API_BASE_URL = 'https://yourdomain.com';
```

## 🔐 Security checklist

- [ ] JWT_SECRET je postavljen
- [ ] MongoDB credentials su sigurni
- [ ] CORS je pravilno konfigurisan
- [ ] Helmet security headers su aktivni
- [ ] Rate limiting je postavljen 