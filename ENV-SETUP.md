# 🔧 Environment Configuration Guide

## 📁 Struktura Environment Fajlova

```
predavanje/
├── .env                    # Glavni env za deployment
├── .env.example           # Template za setup
├── web/
│   ├── .env.development   # Frontend - Development
│   ├── .env.production    # Frontend - Production
│   └── .env               # Frontend - trenutni (symlink)
└── server/
    ├── .env.development   # Backend - Development
    ├── .env.production    # Backend - Production
    └── .env               # Backend - trenutni (symlink)
```

## 🚀 Quick Setup

### 1. Prvi put setup:
```bash
# Kopiraj example fajl
cp .env.example .env

# Edituj vrijednosti u .env fajlu
# Postavi svoje database credentials, SSH keys, itd.
```

### 2. Development mode:
```bash
# Frontend automatski koristi .env.development
cd web && npm run dev

# Backend automatski koristi .env.development  
cd server && npm run dev
```

### 3. Production mode:
```bash
# Frontend koristi .env.production
cd web && npm run build && npm start

# Backend koristi .env.production
cd server && NODE_ENV=production npm start
```

## ⚙️ Environment Varijable

### 🎯 Frontend (web/.env.*)
| Varijabla | Development | Production | Opis |
|-----------|-------------|------------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5003/api` | `https://ders.ba/api` | API endpoint |
| `NEXT_PUBLIC_DEBUG` | `true` | `false` | Debug mode |
| `NEXT_PUBLIC_CACHE_MAX_AGE` | `0` | `3600` | Cache vrijeme |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | `true` | Google Analytics |

### 🔧 Backend (server/.env.*)
| Varijabla | Development | Production | Opis |
|-----------|-------------|------------|------|
| `MONGODB_URI` | `mongodb://localhost:27017/Predavanja` | `mongodb://user:pass@host:port/db` | Database URL |
| `JWT_SECRET` | `dev-secret` | `strong-production-secret` | JWT ključ |
| `DEBUG` | `true` | `false` | Debug logging |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | `100` | Rate limiting |

## 🔒 Sigurnost

### ⚠️ VAŽNO - Produkcijski Secrets:
```bash
# Promijeni ove vrijednosti u produkciji:
JWT_SECRET=WanNeAvdo1994
SESSION_SECRET=WanNeAvdo1994
SMTP_PASS=WanNeAvdo1994
```

### 🛡️ Best Practices:
- ✅ Koristi jake, jedinstvene ključeve za produkciju
- ✅ Nikad ne commituj .env fajlove u git
- ✅ Koristi različite secrets za dev/prod
- ✅ Redovno mijenjaj production secrets

## 🔄 Switching Environments

### Automatski (preporučeno):
```bash
# Development
npm run dev          # automatski koristi .env.development

# Production  
npm run build        # automatski koristi .env.production
npm start
```

### Manualno:
```bash
# Forsiraj development
NODE_ENV=development npm start

# Forsiraj production
NODE_ENV=production npm start
```

## 🐛 Troubleshooting

### Problem: Environment varijable se ne učitavaju
```bash
# Provjeri da li postoje fajlovi:
ls -la web/.env*
ls -la server/.env*

# Provjeri NODE_ENV:
echo $NODE_ENV
```

### Problem: Frontend ne vidi API
```bash
# Provjeri NEXT_PUBLIC_API_URL u web/.env.development:
grep NEXT_PUBLIC_API_URL web/.env.development
```

### Problem: Database connection error
```bash
# Provjeri MONGODB_URI u server/.env.development:
grep MONGODB_URI server/.env.development

# Test konekcije:
cd server && node check-db.js
```

## 📝 Dodavanje Novih Varijabli

### Frontend (NEXT_PUBLIC_ prefix obavezan):
```bash
# web/.env.development
NEXT_PUBLIC_NEW_FEATURE=true

# web/.env.production  
NEXT_PUBLIC_NEW_FEATURE=false
```

### Backend:
```bash
# server/.env.development
NEW_API_KEY=dev-key

# server/.env.production
NEW_API_KEY=prod-key
```

## 🚀 Deployment

Environment fajlovi se automatski koriste tokom deployment-a:
- `web/.env.production` - za frontend build
- `server/.env.production` - za backend server
- `.env` - za deployment skripte (SSH, domain, itd.)

---
*Kreirao: Environment Setup Assistant 🤖* 