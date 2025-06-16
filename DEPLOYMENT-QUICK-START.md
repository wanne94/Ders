# 🚀 DERS.BA Deployment - Quick Start

## 1️⃣ Konfiguracija (jednom)

Uredi `deploy.js` - promijeni ove vrijednosti:

```javascript
const CONFIG = {
  server: {
    host: '192.168.1.100',        // 👈 TVOJA SERVER IP
    username: 'root',             // 👈 TVOJ SSH USERNAME  
    port: 22,                     // 👈 SSH PORT
    deployPath: '/var/www/ders',  // 👈 GDJE DEPLOYOVATI
    domain: 'ders.ba'             // 👈 TVOJ DOMAIN
  }
};
```

## 2️⃣ Test konfiguracije

```bash
npm run deploy:test
```

## 3️⃣ Deploy!

### Prvi put:
```bash
npm run deploy
```

### Brže (samo promjene):
```bash
npm run deploy:quick
```

## ✅ Gotovo!

Tvoja aplikacija je dostupna na: `http://tvoj-domain.com`

---

**Detaljne instrukcije:** `DEPLOYMENT.md` 