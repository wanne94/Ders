# DERS.BA Complete Deployment Guide

## 🚀 Novi Deployment System

Kreirao sam **kompletni deployment sistem** koji kombinuje sve postojeće opcije u jedan jednostavan script.

## 📋 Dostupne opcije

### 1. **Quick Deployment** (Preporučeno)
```bash
# Brzi deployment - slike + server + web
npm run deploy
# ili
node deploy-complete.js deploy
```

**Šta uključuje:**
- ✅ Deployment slika (`deploy-images.js`)
- ✅ Build aplikacija
- ✅ Deployment servera 
- ✅ Deployment web aplikacije
- ✅ Health check
- ✅ Deployment summary

### 2. **Full Deployment** (Sa testovima)
```bash
# Kompletni deployment sa testovima
npm run deploy:full
# ili
node deploy-complete.js full
```

**Šta uključuje:**
- ✅ Deployment slika (`deploy-images.js`)
- ✅ **Pokretanje testova**
- ✅ Build aplikacija
- ✅ Deployment servera 
- ✅ Deployment web aplikacije
- ✅ Health check
- ✅ Deployment summary

### 3. **Parcijalni deployment-i**

```bash
# Samo web aplikacija
npm run deploy:web

# Samo server
npm run deploy:server  

# Samo slike
npm run deploy:images

# Samo health check
npm run health

# Samo backup
npm run backup
```

### 4. **Legacy opcije** (stare)
```bash
# Stari način deployment-a
npm run deploy:legacy

# Brzi deployment (slike + web)
npm run deploy:quick

# Direktni pristup script-ovima
npm run health:check
npm run backup:create
npm run images
```

### 5. **Monitoring i logs**
```bash
# PM2 logs
npm run logs

# PM2 monitoring
npm run monitor
```

## 🎯 Najčešći use case-ovi

### Prva instalacija na server
```bash
npm run deploy:full
```

### Ažuriranje samo web aplikacije
```bash
npm run deploy:web
```

### Dodavanje novih slika
```bash
npm run deploy:images
```

### Provera da li sve radi
```bash
npm run health
```

### Backup pre pomembnih izmena
```bash
npm run backup
```

## 📊 Detaljno objašnjenje Full Deployment-a

### Korak 1: Pre-deployment checks
- ✅ Validacija konfiguracije (.env)
- ✅ Provjera SSH pristupa
- ✅ Provjera foldera i strukture

### Korak 2: Slike (🖼️)
- ✅ Kopiranje 81 fajl iz `public/uploads/` u `web/public/uploads/`
- ✅ Kreiranje strukture foldera

### Korak 3: Testiranje (🧪)
- ✅ Web aplikacija: lint + test + build check
- ✅ Server: osnovni health check

### Korak 4: Build (🔨)
- ✅ Next.js build (`npm run build`)
- ✅ Server: nema build step (Node.js)

### Korak 5: Server deployment (🖥️)
- ✅ Upload server fajlova preko SSH
- ✅ `npm install --production`
- ✅ PM2 restart

### Korak 6: Web deployment (🌐)
- ✅ Upload web build fajlova
- ✅ `npm install --production` 
- ✅ PM2 restart Next.js

### Korak 7: Health Check (🔍)
- ✅ API health endpoint test
- ✅ Web aplikacija test
- ✅ Server status provera

### Korak 8: Summary (📊)
- ✅ Linkovi na web app i API
- ✅ Trajanje deployment-a
- ✅ Next steps

## ⚙️ Konfiguracija

### .env fajl
```env
# Server details
DEPLOY_HOST=194.163.176.171
DEPLOY_USER=root
DEPLOY_PORT=22
DEPLOY_DOMAIN=ders.ba

# MongoDB
MONGODB_URI=mongodb://user:pass@host:27017/db
```

### SSH Key
Default putanja: `~/.ssh/id_ed25519_ders`

Ili postaviti custom putanju:
```env
SSH_KEY_PATH=/path/to/your/ssh/key
```

## 🆘 Help i debugging

### Dobiti pomoć
```bash
node deploy-complete.js help
```

### Debugging koraci

1. **Konfiguracija:**
```bash
# Provjeri da li je sve postavljena
node -e "console.log(require('./scripts/deploy-config').CONFIG)"
```

2. **SSH pristup:**
```bash
# Test SSH konekcije
ssh -i ~/.ssh/id_ed25519_ders root@194.163.176.171
```

3. **Server status:**
```bash
npm run monitor
npm run logs
```

4. **Health check:**
```bash
npm run health
```

## 🔧 Customization

### Dodavanje custom korak-a

Edit `deploy-complete.js` i dodaj funkciju:

```javascript
async function customStep() {
  console.log('🔧 STEP: Custom operation...');
  // your code here
  console.log('✅ Custom operation completed\n');
}
```

Dodaj u deployment sekvenciju:
```javascript
case DEPLOYMENT_OPTIONS.FULL:
  await deployImages();
  await customStep();  // <-- dodano
  await runTests();
  // ...
```

### Dodavanje nove deployment opcije

```javascript
const DEPLOYMENT_OPTIONS = {
  // existing...
  CUSTOM: 'custom'
};
```

U `main()` funkciji:
```javascript
case DEPLOYMENT_OPTIONS.CUSTOM:
  console.log('🔧 Starting CUSTOM deployment...\n');
  await customStep();
  await deploymentSummary(startTime, 'CUSTOM');
  break;
```

U `package.json`:
```json
"deploy:custom": "node deploy-complete.js custom"
```

## 📈 Performance

### Tipična vremena izvršavanja:

- **Images only**: 5-10 sekundi
- **Web only**: 30-60 sekundi  
- **Server only**: 30-45 sekundi
- **Full deployment**: 90-150 sekundi

### Optimizacija:

1. **Cache dependencies** na serveru
2. **Incremental builds** za web
3. **Parallel deployment** za server i web (advanced)

## 🎉 Prednosti novog sistema

### ✅ Jednostavnost
- Jedan komanda za sve: `npm run deploy`
- Jasne opcije za različite scenarije

### ✅ Robusnost  
- Pre-deployment checks
- Detaljno error handling
- Rollback friendly

### ✅ Monitoring
- Health checks nakon deployment-a
- Detaljni logs i summary
- Server status monitoring

### ✅ Fleksibilnost
- Parcijalni deployment-i
- Legacy kompatibilnost
- Custom korak-ovi

### ✅ Developer Experience
- Čist output sa emoji-ima
- Jasno timing i progress
- Help dokumentacija

## 🔄 Migracija sa starog sistema

### Prije (stari način):
```bash
node deploy.js
# ili
npm run deploy:server && npm run deploy:web
```

### Sada (novi način):
```bash
npm run deploy
# ili za iste funkcionalnosti:
npm run deploy:legacy  
```

**Stari script-ovi su i dalje dostupni** za kompatibilnost!

## 📞 Support

- **Issues**: Provjeri logs sa `npm run logs`
- **Health**: Pokreni `npm run health`  
- **Backup**: Uvijek `npm run backup` prije većih izmjena
- **Help**: `node deploy-complete.js help` 