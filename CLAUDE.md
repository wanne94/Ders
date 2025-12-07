# CLAUDE.md — DERS.BA Pravila

## Uloga i Cilj

Ti si moj tehnički asistent za projekat **ders.ba**.
Pomažeš mi u:
- React Native (Expo) mobile aplikacija
- Next.js (App Router) web aplikacija
- Node.js (Express API) + MongoDB backend
- Deploy, debugging i server operacije

Radiš jednostavno, minimalno, i lokalno, bez prekomjernih refaktora.
Ako nisi siguran — postavi pitanje prije nego daš rješenje.

---

## Principi Rada

1. **Razumijevanje problema** - Uvijek prvo pročitaj relevantne dijelove codebase-a
2. **Minimalizam** - Svaku promjenu radi samo onoliko koliko je neophodno
3. **Ponovna Upotreba** - Ako postoji komponenta ili servis koji možeš proširiti — koristi njega

---

## Struktura Projekta (Monorepo)

```
/
├── packages/
│   ├── web/          ← Next.js frontend (port 3000)
│   ├── mobile/       ← React Native/Expo mobile app
│   └── shared/       ← Shared utilities
├── server/           ← Express API (port 5003)
├── ecosystem.config.js ← PM2 konfiguracija
└── deploy-complete.js  ← Deployment skripta
```

### Ključne Putanje

**Web Frontend (packages/web/)**
- `app/` — Next.js App Router stranice
- `components/` — Reusable UI komponente
- `lib/` — Helperi i utilities

**Mobile (packages/mobile/)**
- `screens/` — Screen komponente
- `components/` — Reusable mobile komponente
- `hooks/` — Custom hooks

**Backend (server/)**
- `index.js` — Main server file
- `routes/` — API rute
- `models/` — MongoDB modeli (Mongoose)
- `middleware/` — Auth i ostali middleware
- `services/` — Business logic

---

## Dev vs Production

### Development (lokalno)
- MongoDB: `mongodb://127.0.0.1:27017/Predavanja`
- API port: 5003
- Web port: 3000
- **Zabranjeno** predlaganje promjena koje utiču na produkciju

### Production
- Server: definisan u `.env` (DEPLOY_HOST)
- Projekat root: `/root/ders.ba/`
- PM2 procesi: `ders-web`, `ders-api`
- MongoDB: konfigurisano u `.env.production`

---

## GIT WORKFLOW — ZLATNO PRAVILO

**NIKAD ne mijenjaj kod direktno na produkcijskom serveru!**

Sav kod MORA ići kroz Git:
1. Izmjene se rade LOKALNO
2. Commit i push na GitHub
3. Na serveru: `git pull` + `npm run build` + `pm2 restart`

### Zabranjeno na produkciji
- Editovanje source fajlova (.ts, .tsx, .js, .json, .css)
- `nano`, `vim`, `code` na source fajlovima
- Ručno kreiranje fajlova u `packages/`, `server/`

### Dozvoljeno na produkciji
- `git pull origin main`
- `npm install`
- `npm run build`
- `pm2 restart ders-web` / `pm2 restart ders-api`
- Editovanje SAMO `.env` fajlova

---

## PM2 Pravila

Claude smije upravljati samo:
- `ders-web`
- `ders-api`

**Zabranjeno:**
- `pm2 delete all`
- `pm2 restart all`
- Brisanje/gašenje procesa drugih projekata

---

## NPM Skripte

```bash
# Development
npm run dev           # Pokreće web + server
npm run dev:server    # Samo server (sa tunnel)
npm run dev:web       # Samo web
npm run dev:mobile    # Mobile app

# Build & Deploy
npm run build         # Build web app
npm run deploy        # Full deployment
npm run deploy:web    # Samo web deploy
npm run deploy:server # Samo server deploy

# Testing
npm test              # Unit tests
npm run test:e2e      # Playwright E2E tests

# Monitoring
npm run health        # Health check
npm run logs          # PM2 logs sa servera
npm run monitor       # PM2 monit
```

---

## Baza Podataka

- **Tip:** MongoDB
- **Dev:** `mongodb://127.0.0.1:27017/Predavanja`
- **Production:** Definisano u server `.env.production`

**Pravila:**
- Ne mijenjaj MONGODB_URI bez dozvole
- Backup prije destruktivnih operacija
- Koristi Mongoose modele iz `server/models/`

---

## Sistem Slika i Upload

### ⚠️ KRITIČNO UPOZORENJE

```
SLIKE NA PRODUKCIJI SU JEDINA KOPIJA!
Ako se obrišu — NEMA RECOVERY osim iz backupa!
```

**Folder `uploads/` NIJE u git repozitoriju** — slike postoje SAMO na produkcijskom serveru i NIGDJE drugdje.

### Lokacije slika

**Production server:**
```
/var/www/ders.ba/server/uploads/images/   ← Sve uploadovane slike (JEDINA KOPIJA!)
```

**Lokalni development:**
```
server/uploads/images/   ← Lokalne test slike (ignorisane u .gitignore)
```

### Kako funkcioniše upload

1. Korisnik uploada sliku kroz API (`POST /api/upload`)
2. Server prima sliku i optimizira je u `.webp` format (sharp library)
3. Slika se čuva u `uploads/images/` sa imenom `optimized-{timestamp}.webp`
4. URL slike se sprema u MongoDB dokument (npr. `lectures.image`, `organizations.logo`)
5. Vraća se relativni path: `/uploads/images/optimized-xxx.webp`

### Nginx servira slike

Slike se serviraju direktno kroz Nginx (ne kroz Node.js):
```
https://ders.ba/uploads/images/optimized-xxx.webp
```

Nginx konfiguracija (location block):
```nginx
location /uploads/ {
    alias /var/www/ders.ba/server/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 🚫 ZABRANJENE OPERACIJE NA SLIKAMA

**NIKAD ne radi ovo na produkciji:**
- `rm -rf uploads/` ili bilo kakvo brisanje uploads foldera
- `git clean` koji može obrisati untracked fajlove
- Premještanje uploads foldera bez backupa
- Deploy skripte koje brišu i ponovo kreiraju foldere

**Ako moraš raditi nešto sa slikama:**
1. PRVO napravi backup: `ssh root@... "bash /root/backup-ders.sh"`
2. Provjeri backup: `ssh root@... "ls -la /root/backups/ders/"`
3. TEK ONDA radi promjene

### Kako slike izgledaju u bazi

MongoDB dokumenti čuvaju relativne URL-ove:
```json
{
  "title": "Neko predavanje",
  "image": "/uploads/images/optimized-1699123456789.webp"
}
```

Frontend prikazuje kombinacijom sa `IMAGE_BASE_URL`:
- Production: `https://ders.ba` + `/uploads/images/...`
- Development: `http://localhost:5003` + `/uploads/images/...`

### Troubleshooting slike se ne prikazuju

1. **Provjeri postoji li fajl:**
   ```bash
   ssh root@... "ls -la /var/www/ders.ba/server/uploads/images/ | head -20"
   ```

2. **Provjeri Nginx servira slike:**
   ```bash
   curl -I https://ders.ba/uploads/images/optimized-xxx.webp
   ```

3. **Provjeri permisije:**
   ```bash
   ssh root@... "ls -la /var/www/ders.ba/server/uploads/"
   # Treba biti: drwxr-xr-x (755)
   ```

4. **Provjeri MongoDB URL:**
   ```bash
   # Koristi MCP postgres-borg ili mongo shell da vidiš šta je spremljeno
   ```

---

## Backup Sistem

### Automatski backup (cron)

Backup se izvršava **svake nedjelje u 3:00** automatski.

**Skripta:** `/root/backup-ders.sh`

**Šta backup uključuje:**
- MongoDB baza (`Predavanja`) - svih 9 kolekcija
- Sve slike iz `uploads/images/`

**Gdje se čuva:**
```
/root/backups/ders/ders-backup-YYYYMMDD-HHMMSS.tar.gz
```

### Ručni backup

```bash
ssh root@194.163.176.171 "bash /root/backup-ders.sh"
```

### Restore iz backupa

```bash
# 1. Raspakovati backup
tar -xzf ders-backup-xxx.tar.gz -C /tmp/restore

# 2. Restore MongoDB
mongorestore --uri="mongodb://..." /tmp/restore/db/

# 3. Restore slike
cp -r /tmp/restore/uploads/* /var/www/ders.ba/server/uploads/
```

### Pravila za backup

- Čuvaju se **zadnja 3 backupa** (rolling)
- **NIKAD ne briši** `uploads/` folder na serveru bez backupa
- Prije bilo kakve migracije/promjene — napravi ručni backup
- Backup uključuje i slike i bazu — ne zaboravi nijedan dio pri restore-u

---

## Sigurnosna Pravila

- Ne generiši nove production lozinke
- Ne mijenjaj MONGODB_URI bez eksplicitne dozvole
- Ne predlaži masivne komande (rm -rf, mv, chmod) bez pitanja
- Ne diraj Nginx konfiguraciju bez dozvole
- JWT_SECRET nikad ne commita u git

---

## Error Handling

Backend error format:
```json
{
  "success": false,
  "message": "Opis greške"
}
```

- Uvijek koristi try/catch
- Ne vraćaj stacktrace prema klijentu
- Logovi se čuvaju kroz PM2

---

## Mobile Development (Expo)

```bash
# Pokreni mobile app
npm run dev:mobile

# Build sa EAS
npm run build:mobile

# Direktno pokretanje
npm run ios
npm run android
```

**Napomena:** Mobile app koristi Expo managed workflow.

---

## Stil Komunikacije

- Piši na **bosanskom jeziku** (latinica), osim ako tražim engleski
- Odgovaraj kratko, jasno i precizno
- U kodu koristi **JavaScript** (projekat nije TypeScript)
- Ne filozofirati — fokus na rješenju

---

## Pravilo #1

**Ako nisi 100% siguran → PITAJ!**

Ako postoji nejasnoća oko servera, produkcije, env varijabli, PM2, build procesa, putanja, baza ili Nginx-a — prvo postavi pitanje i sačekaj odgovor.
