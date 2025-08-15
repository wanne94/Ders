# Plan za popravku MongoDB Auth problema na produkciji

## Problem
API endpoints vraćaju "Command find requires authentication" grešku uprkos tome što:
- MongoDB konekcija je uspješna (health endpoint pokazuje "database: connected")
- Direktna konekcija sa mongoose radi
- Lokalni development radi perfektno sa istom bazom

## Analiza

### Simptomi:
1. `/api/health` - RADI ✅
2. `/api/lectures/public` - NE RADI ❌ (auth error)
3. MongoDB konekcija u logu pokazuje "Connected" ✅
4. Ali query operacije zahtijevaju auth ❌

### Moguci uzroci:
1. Razlika u MongoDB driver verziji
2. Problem sa Mongoose connection pooling
3. Razlika u načinu kako se kreira konekcija
4. Problem sa NODE_ENV varijablom
5. Stari kod na produkciji koji ne koristi ispravnu konekciju

## TODO Lista

### 1. ⏳ Analizirati MongoDB auth problem na produkciji
- Provjeriti logove
- Identificirati tačnu grešku

### 2. ⏳ Provjeriti razlike između lokalnog i produkcijskog koda
- Uporediti server/index.js
- Provjeriti database connection kod
- Provjeriti verzije paketa

### 3. ⏳ Identificirati uzrok auth greške
- Testirati direktne MongoDB queries
- Provjeriti Mongoose konfiguraciju

### 4. ⏳ Implementirati popravku
- Ažurirati kod ako je potrebno
- Restartovati servise

### 5. ⏳ Testirati API endpoints
- Test /api/lectures/public
- Test /api/organizations
- Test /api/daije

## Napomene
- Localhost radi perfektno sa SSH tunelom
- Produkcija ima problem samo sa query operacijama