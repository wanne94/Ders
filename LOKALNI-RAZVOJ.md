# 🛠️ Lokalni Razvoj - Development Setup

## 📋 Pregled

Ova konfiguracija omogućava lokalni razvoj sa:
- **Lokalna MongoDB baza**: `Predavanja` na `127.0.0.1:27017`
- **Lokalni upload foldera**: `public/upload/images/`
- **Lokalni server**: `http://localhost:5003`
- **Frontend**: `http://localhost:3000`

## 🚀 Brzo pokretanje

### Opcija 1: Automatska skripta
```bash
# Pokretanje development okruženja
start-dev.bat
```

### Opcija 2: Manuelno pokretanje

1. **Pokretanje servera:**
```bash
cd server
npm run dev
```

2. **Pokretanje frontend-a:**
```bash
cd web
npm run dev
```

## 📁 Struktura foldera za slike

```
public/
└── upload/
    └── images/          # Ovdje se čuvaju uploadovane slike u developmentu
        ├── optimized-1234567890.webp
        └── ...
```

## 🔧 Konfiguracija

### Environment varijable

#### Root .env (za deployment i opšte postavke)
```env
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/Predavanja
NEXT_PUBLIC_API_URL=http://localhost:5003/api
NEXT_PUBLIC_SERVER_URL=http://localhost:5003
PORT=5003
```

#### Server .env.development (automatski se učitava u development modu)
```env
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/Predavanja
JWT_SECRET=neka-jaka-tajna-AvdoWanNe1994
PORT=5003
DEBUG=true
LOG_LEVEL=debug
```

#### Web .env.development (za Next.js frontend)
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5003/api
NEXT_PUBLIC_SERVER_URL=http://localhost:5003
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=true
```

### Upload konfiguracija
- **Development**: Slike se čuvaju u `public/upload/images/`
- **Production**: Slike se čuvaju u `/var/www/uploads/images/`
- **URL format**: 
  - Development: `/upload/images/filename.webp`
  - Production: `/uploads/images/filename.webp`

## 🧪 Testiranje

### Test upload endpoint-a:
```
GET http://localhost:5003/api/upload-image/test
```

### Test upload slike:
```bash
curl -X POST -F "image=@test-image.jpg" http://localhost:5003/api/upload-image/
```

## 📊 MongoDB

### Lokalna baza
- **Host**: `127.0.0.1:27017`
- **Database**: `Predavanja`
- **Kolekcije**: `lectures`, `users`, `organizations`, `daije`, `suggestions`, `settings`

### Provjera konekcije
```bash
# Test lokalne MongoDB baze
test-local-db.bat

# Ili manuelno u server direktoriju
cd server
set NODE_ENV=development
node check-db.js
```

### Pokretanje MongoDB-a
```bash
# Windows servis
net start MongoDB

# Ili direktno
mongod

# Provjera da li radi
mongosh --eval "db.adminCommand('ismaster')"
```

## 🔄 Prebacivanje između Development i Production

### Za lokalni razvoj:
1. Postaviti `NODE_ENV=development` u `.env`
2. Koristiti lokalni MongoDB URI
3. Pokrenuti sa `npm run dev`

### Za produkciju:
1. Postaviti `NODE_ENV=production` u `.env`
2. Koristiti produkcijski MongoDB URI
3. Pokrenuti sa `npm run prod`

## 🐛 Troubleshooting

### Problem sa MongoDB konekcijom:
```bash
# Provjeri da li je MongoDB pokrenut
net start MongoDB

# Ili pokreni MongoDB Community Server
mongod
```

### Problem sa upload folderom:
```bash
# Kreiraj folder ako ne postoji
mkdir -p public/upload/images
```

### Problem sa portovima:
- Server: `5003`
- Frontend: `3000`
- MongoDB: `27017`

Provjeri da li su portovi slobodni:
```bash
netstat -an | findstr :5003
netstat -an | findstr :3000
netstat -an | findstr :27017
``` 