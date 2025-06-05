# 🚀 Deployment Instrukcije

## 📦 Kreiranje Production Build-a

### 1. **Kreiraj build:**
```bash
npm run build
```

### 2. **Test production build lokalno:**
```bash
npm run test:production
```

## 📁 **Fajlovi za Server Upload**

Nakon `npm run build`, uploadaj ove foldere/fajlove na server:

### **Frontend (Static Files):**
- **`/out/`** - Kompletan frontend build
- **`/public/uploads/`** - User uploaded files

### **Backend (API Server):**
- **`/server/`** - Kompletan server folder
  - `index.js`
  - `package.json`
  - `models/`
  - `middleware/`
  - `utils/`
  - `.env` (s production vrijednostima)

## 🌐 **Server Konfiguracija**

### **Environment varijable (.env):**
```env
# Production MongoDB
MONGODB_URI=mongodb+srv://WanNe:WanNeAvdo1994@cluster0.nyvtdbm.mongodb.net/Predavanja?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=neka-jaka-tajna-AvdoWanNe1994

# Port
PORT=5003

# Node Environment
NODE_ENV=production
```

### **Server Setup Commands:**
```bash
# Na serveru, idi u server folder
cd server

# Instaliraj dependencies
npm install --production

# Pokreni server
npm start
```

## 🔧 **Nginx Konfiguracija (ako koristiš Nginx):**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Statični fajlovi (frontend)
    location / {
        root /path/to/your/app/out;
        try_files $uri $uri/ /index.html;
    }
    
    # API rute
    location /api/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Upload fajlovi
    location /uploads/ {
        proxy_pass http://localhost:5003;
    }
}
```

## ✅ **Provjera Deployment-a**

1. **Frontend**: `https://yourdomain.com`
2. **API Health**: `https://yourdomain.com/api/`
3. **Database Test**: `https://yourdomain.com/api/test-db`
4. **JWT Test**: `https://yourdomain.com/api/test-jwt` (with Bearer token)

## 📝 **Deployment Checklist**

- [ ] Production build kreiran (`npm run build`)
- [ ] `/out` folder uploadovan na server
- [ ] `/server` folder uploadovan na server  
- [ ] Server dependencies instalirani (`npm install --production`)
- [ ] Environment varijable postavljene
- [ ] MongoDB connection radi
- [ ] Server pokrenut (`npm start`)
- [ ] Nginx/Apache konfigurisan (ako se koristi)
- [ ] SSL certifikat postavljen (preporučeno)
- [ ] Firewall konfigurisan (port 5003 za API)

## 🔄 **Update Process:**

```bash
# Lokalno
npm run build

# Upload samo /out folder na server (frontend update)
# Za backend update, uploadaj /server folder i restartaj server
``` 