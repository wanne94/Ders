# Jednostavno rješenje za slike - CDN pristup

## Pregled rješenja

Predlažem jednostavan CDN pristup koji rješava sve trenutne probleme:

### 1. **Struktura foldera na serveru**
```
/var/www/ders/server/
└── cdn/
    └── images/
        ├── uploads/     # Korisničke slike
        ├── defaults/    # Defaultne slike aplikacije
        └── thumbnails/  # Auto-generirani thumbnail-i
```

### 2. **Nginx konfiguracija**
- Direktno serviranje slika sa diska (bypass Node.js)
- Automatski WebP fallback
- Optimizirano keširanje (30 dana za uploads, 90 za defaults)
- CORS podrška za mobile app
- Legacy `/uploads` redirect na novi `/cdn` path

### 3. **Optimizacija pri upload-u**
```javascript
// Generiši 3 veličine automatski:
- original: max 1920px širine, 80% kvalitet
- medium: max 800px širine, 75% kvalitet  
- thumb: max 200px širine, 70% kvalitet

// Format: WebP sa JPEG fallback
// Naming: {uuid}-{size}.webp
```

### 4. **Implementacija korak po korak**

#### Korak 1: Priprema servera
```bash
# SSH na server
ssh username@194.163.176.171

# Kreiraj CDN strukturu
cd /var/www/ders/server
mkdir -p cdn/images/{uploads,defaults,thumbnails}

# Kopiraj postojeće slike
cp -r uploads/images/* cdn/images/uploads/
cp uploads/*.jpg cdn/images/defaults/
cp uploads/*.png cdn/images/defaults/
```

#### Korak 2: Update Nginx
```bash
# Backup trenutne konfiguracije
sudo cp /etc/nginx/sites-available/ders.ba /etc/nginx/sites-available/ders.ba.backup

# Primijeni novu konfiguraciju
sudo nano /etc/nginx/sites-available/ders.ba
# Kopiraj sadržaj iz nginx-cdn-config.conf

# Test konfiguracije
sudo nginx -t

# Reload ako je sve OK
sudo nginx -s reload
```

#### Korak 3: Update server koda
Treba update-ovati:
- `/server/routes/uploadImage.js` - dodati generisanje više veličina
- `/server/index.js` - ukloniti static serving za /uploads

#### Korak 4: Update utility funkcija
- `/web/src/utils/imageUtils.js` - promijeniti putanje na /cdn/images
- `/mob/utils/imageUtils.js` - ista promjena

### 5. **Prednosti ovog pristupa**

✅ **Jednostavnost** - Samo promjena putanja, isti API
✅ **Performanse** - Nginx direktno servira, bez Node.js overhead
✅ **Skalabilnost** - Lako dodavanje CDN servisa kasnije
✅ **Kompatibilnost** - Legacy /uploads automatski redirect
✅ **Optimizacija** - 3x manje prostora sa WebP
✅ **Offline** - Mobile može keširati slike lokalno

### 6. **Migracija bez prekida**

1. Deploy novi kod sa podrškom za oba path-a
2. Postupno prebaci slike na CDN
3. Redirect legacy putanje
4. Nema prekida servisa!

## Sljedeći koraci

Želiš li da:
1. Pripremim update za server kod (uploadImage.js)?
2. Napravim update za image utility funkcije?
3. Napišem skriptu za migraciju postojećih slika?