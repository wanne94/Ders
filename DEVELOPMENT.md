# 🔧 Development & Deployment Guide

## 🏠 Lokalni Development

### 1. **Setup za Development:**
```bash
# Podesi environment za lokalni rad
npm run env:dev

# Pokreni development server (frontend only)
npm run dev

# ILI pokreni frontend + backend zajedno
npm run dev:full
```

### 2. **Development URLs:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5003/api

### 3. **Environment varijable (lokalno):**
- API URL: `http://localhost:5003/api`
- Debug mode: UKLJUČEN
- Dev tools: UKLJUČENI

## 🚀 Production Deployment

### 1. **Kreiranje Production Build-a:**
```bash
# Automatski podesi production environment i kreiraj build
npm run deploy:build

# ILI ručno:
npm run env:prod
npm run clean
npm run build
```

### 2. **Testiranje Build-a Lokalno:**
```bash
# Test production build-a na lokalnom računaru
npm run deploy:local-test
```

### 3. **Fajlovi za Upload na Server:**

After `npm run build`, uploadajte ove foldere:

#### **Frontend Static Files:**
- **`/.next/`** - Next.js optimized build
- **`/out/`** - Static export (ako koristite)
- **`/public/`** - Static assets

#### **Backend Server:**
- **`/server/`** - Kompletan server folder

### 4. **Server Environment (194.163.176.171):**
Production URLs:
- **Frontend:** http://194.163.176.171
- **API:** http://194.163.176.171:5003/api

## 📋 Quick Commands

| Command | Opis |
|---------|------|
| `npm run env:dev` | Prebaci na development environment |
| `npm run env:prod` | Prebaci na production environment |
| `npm run dev` | Pokreni development server |
| `npm run dev:full` | Pokreni frontend + backend |
| `npm run deploy:build` | Kreiraj production build |
| `npm run deploy:local-test` | Test production build lokalno |
| `npm run clean` | Obriši build cache |

## 🔄 Workflow

### **Za Development:**
1. `npm run env:dev` - Podesi development
2. `npm run dev:full` - Pokreni sve servise
3. Edituj kod, promjene se automatski refresh-uju
4. Test u browseru na http://localhost:3000

### **Za Production Deploy:**
1. `npm run deploy:build` - Kreiraj build
2. Upload `/server/` folder na server
3. Upload build fajlove na server
4. Restart server services

## 🐛 Troubleshooting

### **Problem: API connection failed**
- Provjeri da li backend server radi na portu 5003
- Provjeri environment varijable u `.env`

### **Problem: Build fails**
```bash
npm run clean
npm install
npm run deploy:build
```

### **Problem: Development server won't start**
```bash
# Provjeri da li je port zauzet
npx kill-port 3000
npm run dev
``` 