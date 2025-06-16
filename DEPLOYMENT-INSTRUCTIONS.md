# 🚀 DERS.BA Deployment Instrukcije

Ovaj dokument objašnjava kako da koristiš nove deployment skripte za DERS.BA aplikaciju.

## 📋 Preduslovi

### 1. Environment konfiguracija

Provjeri da li je `.env` fajl pravilno konfigurisan:

```env
# Deployment Configuration
DEPLOY_HOST=194.163.176.171
DEPLOY_USER=root
DEPLOY_PORT=22
DEPLOY_DOMAIN=ders.ba

# Server URL Configuration
NEXT_PUBLIC_SERVER_URL=https://ders.ba

# MongoDB Configuration
MONGODB_URI=mongodb://avdoAdmin:WanNeAvdo1994@194.163.176.171:27017/Predavanja?authSource=admin
```

### 2. SSH pristup

Obavezi se da imaš SSH pristup serveru:
- SSH ključ je postavljen
- Možeš se povezati na server bez unošenja password-a

### 3. Server priprema

Na produkcijskom serveru mora biti instaliran:
- Node.js (v18+)
- PM2 (`npm install -g pm2`)
- rsync

## 🚀 Komande za Deployment

### Osnovne NPM komande

```bash
# Deploya i web i server aplikaciju
npm run deploy

# Deploya samo web aplikaciju (frontend)
npm run deploy:web

# Deploya samo server aplikaciju (backend)
npm run deploy:server

# Provjeri zdravlje aplikacije na serveru
npm run health
```

### Alternativni načini pokretanja

#### Windows:
```cmd
# Deploya sve
deploy.bat

# Samo web
deploy.bat web

# Samo server
deploy.bat server

# Health check
deploy.bat health

# Pomoć
deploy.bat help
```

#### Linux/Mac:
```bash
# Deploya sve
./deploy.sh

# Samo web
./deploy.sh web

# Samo server
./deploy.sh server

# Health check
./deploy.sh health

# Pomoć
./deploy.sh help
```

## 🔧 Šta radi svaka komanda

### `npm run deploy:web`

1. **Build** - Pokretava `npm run build` u `web/` folderu
2. **Upload** - Kopira built aplikaciju na server over SSH/rsync
3. **Install** - Pokreće `npm ci --production` na serveru
4. **PM2** - Provjeri da li postoji `ders-web` proces:
   - Ako postoji: Restarta ga (`pm2 restart ders-web`)
   - Ako ne postoji: Kreira novi (`pm2 start npm --name "ders-web" -- start`)

### `npm run deploy:server`

1. **Upload** - Kopira server fajlove na server preko SSH/rsync
2. **Install** - Pokreće `npm ci --production` na serveru
3. **PM2** - Provjeri da li postoji `ders-server` proces:
   - Ako postoji: Restarta ga (`pm2 restart ders-server`)
   - Ako ne postoji: Kreira novi (`pm2 start index.js --name "ders-server"`)

### `npm run deploy`

- Pokreće `deploy:server` a zatim `deploy:web` sekvencijalno

### `npm run health`

- Povezuje se na server preko SSH
- Provjeri PM2 status (`pm2 list`)
- Prikaže status `ders-web` i `ders-server` aplikacija

## 📂 Struktura na serveru

```
/var/www/ders/
├── web/          # Next.js aplikacija
│   ├── .next/    # Built aplikacija
│   ├── package.json
│   └── ...
└── server/       # Node.js/Express server
    ├── index.js
    ├── package.json
    └── ...
```

## 🔍 PM2 procesi

- **ders-web**: Next.js frontend aplikacija
- **ders-server**: Node.js backend server

## 🆘 Troubleshooting

### SSH konekcija ne radi

```bash
# Test SSH konekcije
ssh -p 22 root@194.163.176.171

# Dodaj SSH ključ ako treba
ssh-copy-id -p 22 root@194.163.176.171
```

### PM2 problemi

```bash
# Direktno na serveru - provjeri PM2 status
pm2 list
pm2 logs
pm2 monit

# Lokalno - SSH pristup PM2
npm run logs
npm run monitor
```

### Deployment neuspješan

1. Provjeri `.env` konfiguraciju
2. Provjeri SSH pristup
3. Pokreni `npm run health` da vidiš status
4. Pogledaj logove: `npm run logs`

### Dependency greške

```bash
# Obriši node_modules i reinstaliraj lokalno
rm -rf node_modules package-lock.json
npm install

# Obriši cache na serveru (SSH)
ssh -p 22 root@194.163.176.171 "cd /var/www/ders/web && rm -rf node_modules .next && npm ci"
```

## 📊 Tipičan Workflow

1. **Razvoj**: Uradi promjene u kodu
2. **Test lokalno**: `npm run dev` da testiraš promjene
3. **Deploy**: 
   - Brži: `npm run deploy:web` (ako su samo frontend promjene)
   - Komplet: `npm run deploy` (ako su i frontend i backend promjene)
4. **Provjeri**: `npm run health` da vidiš da li je sve ok
5. **Monitor**: `npm run logs` da praviš log fajlove

## 🔗 Korisni linkovi

- **Web aplikacija**: https://ders.ba
- **API endpoint**: https://ders.ba/api
- **Monitoring**: `npm run monitor`
- **Logs**: `npm run logs`

---

**Napomena**: Sve skripte koriste rsync za brže upload fajlova. Prvič deployment može biti spor, ali sljedeći će biti brži jer se kopiraju samo promijenjeni fajlovi. 