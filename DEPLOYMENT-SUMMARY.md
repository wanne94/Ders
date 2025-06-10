# 🚀 DERS.BA Deployment - Kratak Pregled

## ✅ Kreiran novi deployment sistem

### Glavne NPM komande:
- `npm run deploy` - Deploy i web i server
- `npm run deploy:web` - Deploy samo frontend  
- `npm run deploy:server` - Deploy samo backend
- `npm run health` - Provjeri status aplikacija

### Fajlovi kreirani:
- `deploy-complete.js` - Glavni deployment script
- `deploy.bat` - Windows batch fajl za lakše pokretanje
- `deploy.sh` - Linux shell script za lakše pokretanje
- `DEPLOYMENT-INSTRUCTIONS.md` - Detaljne instrukcije

### Kako funkcioniše:

#### Web deployment (`npm run deploy:web`):
1. Build Next.js aplikacije u `web/` folderu
2. Kreiranje zip arhive (bez node_modules, .git, itd.)
3. Upload zip fajla na server preko SSH
4. Raspakivanje na serveru u `/var/www/ders/web/`
5. Instaliranje dependencies sa `npm ci --production`
6. PM2 restart/pokretanje `ders-web` procesa

#### Server deployment (`npm run deploy:server`):
1. Kreiranje zip arhive server fajlova (bez node_modules, logova, itd.)
2. Upload zip fajla na server preko SSH
3. Raspakivanje na serveru u `/var/www/ders/server/`
4. Instaliranje dependencies sa `npm ci --production`
5. PM2 restart/pokretanje `ders-server` procesa

### PM2 procesi na serveru:
- `ders-web` - Next.js frontend aplikacija
- `ders-server` - Node.js backend server

### Automatska provjera PM2:
- Ako proces postoji → restartuje ga
- Ako proces ne postoji → kreira novi

### Környezet varijable (.env):
```
DEPLOY_HOST=194.163.176.171
DEPLOY_USER=root
DEPLOY_PORT=22
DEPLOY_DOMAIN=ders.ba
```

### Brzo pokretanje:
```bash
# Sve odjednom
npm run deploy

# Samo frontend
npm run deploy:web

# Samo backend  
npm run deploy:server

# Provjeri status
npm run health
```

### Alternative komande:
- Windows: `deploy.bat` ili `deploy.bat web`
- Linux/Mac: `./deploy.sh` ili `./deploy.sh web`

---

**Napomena**: Sistem koristi zip/unzip umjesto rsync, što omogućava rad na Windows-u i Linux-u.

**Prva upotreba**: Uradi `npm install` da instaliraš ssh2 dependency. 