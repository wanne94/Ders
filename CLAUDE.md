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
