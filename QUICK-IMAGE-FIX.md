# Brzo rešavanje problema sa slikama na produkciji

## Problem
```
GET https://ders.ba/uploads/images/optimized-1749466650678.webp 404 (Not Found)
```

## Rešenje u 3 koraka

### 1. Kopiraj slike
```bash
# U root direktoriju projekta
node deploy-images.js
```

### 2. Deploy aplikaciju
```bash
# Koristi postojeći deployment script
node deploy.js
```

### 3. Podesi nginx (na serveru)

Dodaj u nginx config (`/etc/nginx/sites-available/ders.ba`):

```nginx
# Serviranje slika
location /uploads/ {
    alias /var/www/ders/web/public/uploads/;
    
    location ~* \.(webp|jpg|jpeg|png|gif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    try_files $uri /uploads/default-image.webp;
}
```

Restart nginx:
```bash
nginx -t && systemctl reload nginx
```

## Test
```bash
curl -I https://ders.ba/uploads/images/optimized-1749466650678.webp
```

Trebao bi vratiti `200 OK`.

## Šta script radi
- Kopira sve slike iz `public/uploads/` u `web/public/uploads/`
- Kopira 81 fajl (79 optimized slika + 2 default)
- Kreira istu strukturu foldera kao u developmentu

## Ako i dalje ne radi

1. Provjeri putanje na serveru:
```bash
ls -la /var/www/ders/web/public/uploads/images/
```

2. Provjeri nginx logs:
```bash
tail -f /var/log/nginx/error.log
```

3. Test direktno:
```bash
curl http://localhost:3000/uploads/images/optimized-1749466650678.webp
``` 