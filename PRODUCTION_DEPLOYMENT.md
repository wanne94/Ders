# Production Deployment Guide

## 🚀 Mobilna Aplikacija - Production Build

### Preduslovi:
1. **EAS CLI instaliran globalno:**
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Expo account kreiran i ulogovan:**
   ```bash
   eas login
   ```

### Build Process:

#### 1. **Android APK (za testiranje):**
```bash
cd mobile
eas build --platform android --profile preview
```

#### 2. **Android App Bundle (za Google Play Store):**
```bash
cd mobile
eas build --platform android --profile production
```

#### 3. **iOS Build (za App Store):**
```bash
cd mobile
eas build --platform ios --profile production
```

### Konfiguracija API-ja:
- **Development:** Koristi `http://localhost:5003`
- **Production:** Automatski koristi `http://194.163.176.171:5003`

---

## 🖥️ Server - Production Deployment

### 1. **Lokalno testiranje production mode:**
```bash
cd server
npm run prod
```

### 2. **Deployment na server (194.163.176.171):**

#### A. **Preko SSH:**
```bash
# Kopiraj fajlove na server
scp -r server/ user@194.163.176.171:/path/to/app/

# Uloguj se na server
ssh user@194.163.176.171

# Instaliraj dependencies
cd /path/to/app/server
npm install --production

# Pokreni aplikaciju
npm start
```

#### B. **Korišćenjem PM2 (preporučeno):**
```bash
# Instaliraj PM2 globalno na serveru
npm install -g pm2

# Pokreni aplikaciju sa PM2
pm2 start index.js --name "predavanje-api"

# Sačuvaj PM2 konfiguraciju
pm2 save
pm2 startup
```

### 3. **Environment Variables (.env):**
```env
MONGODB_URI=mongodb://avdoAdmin:WanNeAvdo1994@194.163.176.171:27017/Predavanja?authSource=admin
JWT_SECRET=neka-jaka-tajna-AvdoWanNe1994
NODE_ENV=production
PORT=5003
```

---

## 🔧 Nginx Konfiguracija (opciono)

Ako koristiš Nginx kao reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
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
}
```

---

## 📱 Testiranje Production Build-a

### 1. **Android:**
- Instaliraj APK na device
- Testiraj sve funkcionalnosti
- Provjeri da li API pozivi rade sa production serverom

### 2. **iOS:**
- Koristi TestFlight za distribuciju
- Testiraj na različitim iOS uređajima

---

## 🔍 Monitoring i Logs

### Server Logs:
```bash
# Prati logs u real-time
tail -f combined.log

# PM2 logs
pm2 logs predavanje-api
```

### Mobile App Debugging:
- Koristi Flipper ili React Native Debugger
- Provjeri network requests u dev tools

---

## 🚨 Troubleshooting

### Česti problemi:

1. **API Connection Failed:**
   - Provjeri da li je server pokrenut na portu 5003
   - Provjeri firewall postavke
   - Provjeri da li je MongoDB dostupan

2. **Build Failed:**
   - Provjeri EAS konfiguraciju
   - Provjeri da li su svi dependencies instalirani
   - Provjeri app.json konfiguraciju

3. **Authentication Issues:**
   - Provjeri JWT_SECRET u .env fajlu
   - Provjeri MongoDB konekciju
   - Provjeri CORS postavke na serveru

---

## 📋 Checklist prije Production:

- [ ] Server radi na production URL-u
- [ ] MongoDB konekcija je stabilna
- [ ] API endpoints su testirani
- [ ] Mobile app koristi production API URL
- [ ] SSL sertifikat je instaliran (ako koristiš HTTPS)
- [ ] Backup strategija je implementirana
- [ ] Monitoring je postavljen
- [ ] Error logging je konfigurisan 