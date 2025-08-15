# Plan za popravku produkcijskog servera ders.ba

## Problem
Produkcijski server ders.ba je prestao raditi nakon pokušaja dodavanja rizz projekta i izmjene nginx konfiguracije.

## TODO Lista

### 1. ⏳ Analizirati trenutne nginx konfiguracije na produkcijskom serveru
- SSH na produkcijski server
- Provjeriti sve nginx konfiguracije u /etc/nginx/
- Identificirati problematične konfiguracije

### 2. ⏳ Provjeriti status servisa na produkciji
- nginx status
- Node.js aplikacije (PM2)
- MongoDB status
- Provjeriti portove i procese

### 3. ⏳ Backup trenutnih konfiguracija prije promjena
- Backup nginx konfiguracija
- Backup PM2 konfiguracija
- Dokumentovati trenutno stanje

### 4. ⏳ Popraviti nginx konfiguraciju za ders.ba
- Vratiti ispravnu nginx konfiguraciju
- Ukloniti rizz projekat konfiguracije koje kvare ders.ba
- Provjeriti SSL certifikate

### 5. ⏳ Deployovati najnoviji kod na produkciju
- Pushati lokalne promjene
- Pull na produkcijskom serveru
- Rebuild aplikacije

### 6. ⏳ Restartovati servise na produkciji
- Restart nginx
- Restart PM2 aplikacije
- Provjeriti da sve radi

### 7. ⏳ Testirati https://ders.ba
- Provjeriti da se web stranica učitava
- Testirati API endpoints
- Provjeriti funkcionalnosti

### 8. ⏳ Testirati mobilnu aplikaciju
- Provjeriti konekciju sa API-jem
- Testirati osnovne funkcionalnosti

## Napomene
- Localhost trenutno radi perfektno sa SSH tunelom na produkcijsku bazu
- Produkcija je pokvarena zbog nginx konfiguracije
- Potrebno je pažljivo vratiti originalne postavke za ders.ba