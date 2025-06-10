# NGINX Konfiguracija za DERS Slike

## Problem
Aplikacija traži slike na putanji `https://ders.ba/uploads/images/optimized-xxxxx.webp` ali ih ne pronalazi jer nginx ne servira statičke fajlove.

## Rešenje

### 1. Kreiranje strukture foldera na serveru

Prvo pokretanje script-a za deployment slika:

```bash
# Iz root direktorija projekta
node deploy-images.js

# ili na Linux serveru
chmod +x deploy-images.sh
./deploy-images.sh
```

### 2. Nginx konfiguracija

Dodaj u nginx konfiguraciju za `ders.ba`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name ders.ba www.ders.ba;

    # SSL konfiguracija...
    
    # Root direktorij za statičke fajlove
    root /path/to/your/project/web/public;
    
    # Serviranje slika i statičkih fajlova
    location /uploads/ {
        alias /path/to/your/project/web/public/uploads/;
        
        # Cache headers za slike
        location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        
        # Fallback za missing images
        try_files $uri $uri/ /uploads/default-image.webp;
    }
    
    # Serviranje default slika
    location = /uploads/default-image.webp {
        alias /path/to/your/project/web/public/uploads/default-image.webp;
    }
    
    location = /uploads/default-organization.webp {
        alias /path/to/your/project/web/public/uploads/default-organization.webp;
    }
    
    # Next.js aplikacija
    location / {
        proxy_pass http://localhost:3000;  # ili port gde je Next.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API rute (ako su potrebne)
    location /api/ {
        proxy_pass http://localhost:5003;  # Backend server port
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

### 3. Alternativna konfiguracija (ako Next.js je static export)

Ako koristiš `next export`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name ders.ba www.ders.ba;

    # Root direktorij - Next.js build output
    root /path/to/your/project/out;
    index index.html;
    
    # Serviranje slika
    location /uploads/ {
        alias /path/to/your/project/web/public/uploads/;
        
        # Cache headers
        location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        try_files $uri $uri/ /uploads/default-image.webp;
    }
    
    # Next.js static files
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
    
    # API rute (backend server)
    location /api/ {
        proxy_pass http://localhost:5003;
        # proxy headers...
    }
}
```

### 4. Dodavanje mime types

Provjeri da li nginx ima WebP mime type u `/etc/nginx/mime.types`:

```
image/webp webp;
```

Ili dodaj u server blok:

```nginx
location ~* \.webp$ {
    add_header Content-Type image/webp;
}
```

### 5. Kreiranje symlink-a (alternativa)

Ako ne želiš kopirate fajlove, možeš kreirati symlink:

```bash
# Iz web/public direktorija
ln -s ../../public/uploads uploads
```

## Test konfiguracije

### 1. Test nginx konfiguracije
```bash
nginx -t
```

### 2. Restart nginx
```bash
systemctl reload nginx
# ili
service nginx reload
```

### 3. Test pristupa slikama
```bash
curl -I https://ders.ba/uploads/images/optimized-1749466650678.webp
```

Trebao bi vratiti `200 OK` sa `Content-Type: image/webp`.

## Debugging

### 1. Nginx error log
```bash
tail -f /var/log/nginx/error.log
```

### 2. Nginx access log
```bash
tail -f /var/log/nginx/access.log
```

### 3. Provjera fajlova
```bash
ls -la /path/to/your/project/web/public/uploads/images/
```

### 4. Test localhost
```bash
# Ako se Next.js pokreće na 3000
curl http://localhost:3000/uploads/images/optimized-1749466650678.webp
```

## Česti problemi

1. **403 Forbidden**: Provjeri permissions na fajlove i direktorije
2. **404 Not Found**: Provjeri putanje u nginx konfiguraciji
3. **Wrong MIME type**: Dodaj WebP mime type
4. **CORS errors**: Dodaj CORS headers za slike

## Automatski deployment

Dodaj u `deploy.js` ili deployment script:

```javascript
// Dodaj na vrh deployment scripta
const { deployImages } = require('./deploy-images');

// U deployment funkciji
console.log('🖼️  Deploying images...');
deployImages();
``` 