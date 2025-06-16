# Plan za povratak na jednostavnu strukturu slika

## 🎯 Cilj
Vratiti na jednostavnu strukturu sa `server/uploads` folderom gdje sve slike rade konzistentno u developmentu i produkciji.

## 📋 Promjene koje treba napraviti

### 1. Server promjene

#### A. Vrati uploadImage.js na jednostavnu strukturu
- Ukloni CDN logiku
- Koristi samo `server/uploads/images` folder
- Zadrži WebP optimizaciju
- Vrati jednostavan response sa `/uploads/images/filename.webp`

#### B. Vrati index.js na jednostavno serviranje
- Ukloni CDN serving
- Zadrži samo `/uploads` static serving

### 2. Web app promjene

#### A. Obnovi imageUtils.js
- Koristi jednostavnu logiku
- Samo `/uploads/images/` putanje
- Base URL: `https://ders.ba`
- Default slike u `/uploads/images/`

### 3. Mobile app promjene

#### A. Obnovi imageUtils.js
- Ista logika kao web
- Upload funkcija vraća `/uploads/images/` putanje

### 4. Nginx konfiguracija

#### A. Jednostavna konfiguracija
- Proxy `/uploads` na Express server
- Cache optimizacija
- Bez CDN složenosti

## 🔍 Provjera konzistentnosti

### 1. Komponente koje koriste slike
Treba pronaći i provjeriti:
- `UniversalCard.jsx` (web)
- `UniverzalCard.js` (mobile)
- Sve card komponente
- Profile komponente
- Image preview komponente

### 2. Putanje koje treba provjeriti
- Default slike: `/uploads/images/predavanjeslika.jpg`
- Upload slike: `/uploads/images/optimized-*.webp`
- Logo: `/uploads/logo.jpg`
- Favicon: `/uploads/images/favicon.png`

### 3. API pozivi
- Upload endpoint: `/api/upload-image`
- Response format: `{ success: true, path: "/uploads/images/filename.webp" }`

## 🚀 Implementacija

### Korak 1: Server promjene
1. Vrati uploadImage.js na originalnu logiku
2. Vrati index.js static serving
3. Ukloni uuid dependency ako se ne koristi drugdje

### Korak 2: Web utilities
1. Obnovi imageUtils.js sa jednostavnom logikom
2. Provjeri sve komponente koje koriste slike

### Korak 3: Mobile utilities  
1. Obnovi imageUtils.js
2. Provjeri upload funkcionalnost

### Korak 4: Testiranje
1. Test upload-a u web app-u
2. Test upload-a u mobile app-u
3. Test prikaza postojećih slika
4. Test default slika

### Korak 5: Nginx
1. Vrati na jednostavnu konfiguraciju
2. Test serviranje slika

## ✅ Kriteriji uspjeha

1. **Upload radi** - Web i mobile mogu upload-ovati slike
2. **Prikaz radi** - Sve slike se prikazuju u dev i prod
3. **Default slike rade** - Sve default slike se učitavaju
4. **Jednostavna logika** - Nema CDN složenosti
5. **Konzistentnost** - Isti putanja pattern svugdje

## 🔄 Rollback plan

Ako nešto ne radi, mogu brzo vratiti na trenutno stanje jer ću zadržati backup fajlove.