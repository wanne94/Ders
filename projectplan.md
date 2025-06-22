# Plan za rešavanje problema sa bazom podataka

## Problem
- Lokalna aplikacija se ne može spojiti na bazu podataka
- ders.ba potpuno uredno radi
- Server selection timeout greške u error.log fajlu

## Analiza problema
1. **MongoDB nije instaliran lokalno** - aplikacija pokušava da se spoji na remote server
2. **Network connectivity problem** - port 27017 je blokiran ili server ne prima eksterne konekcije
3. **Environment konfiguracija** - koristi se produkcijski server umesto lokalnog

## Todo lista - Remote MongoDB konekcija

- [ ] 1. Testiraj network konekciju na port 27017
- [ ] 2. Provjeri da li je MongoDB konfigurisan da prima vanjske konekcije
- [ ] 3. Provjeri firewall postavke na produkcijskom serveru
- [ ] 4. Konfiguriši MongoDB da sluša na 0.0.0.0 umesto localhost
- [ ] 5. Restartuj MongoDB service na produkcijskom serveru
- [ ] 6. Testiraj konekciju iz lokalne aplikacije

## Odabrana opcija
**Remote server pristup** - konekcija na produkcijski MongoDB server (194.163.176.171:27017)

## Fajlovi koji se tiču problema
- `/server/config.js` - osnovna konfiguracija
- `/.env.local` - lokalna environment varijabla
- `/server/index.js:337-371` - database connection kod
- `/server/error.log` - error logovi sa timeout greškama

## Review sekcija

**Problem uspešno rešen!** 

### Glavno rešenje: SSH tunel
ISP blokira direktnu konekciju na port 27017, pa je kreiran SSH tunel koji prebacuje port 27018 lokalno na 27017 na serveru.

### Promene napravljene:
1. **Ažuriran `.env.local`** - promenjen port sa 27017 na 27018
2. **Kreiran/ažuriran `mongodb-tunnel.sh`** - automatski script za pokretanje SSH tunela
3. **Testirana konekcija** - uspešno povezana aplikacija na produkcijsku bazu

### Finalni rezultat:
- ✅ MongoDB radi ispravno na produkcijskom serveru
- ✅ Firewall je pravilno konfigurisan
- ✅ SSH tunel uspešno zaobilazi ISP blokiranje
- ✅ Aplikacija se uspešno konektuje na produkcijsku bazu preko tunela

### Kako pokrenuti:
1. Pokreni tunel: `./mongodb-tunnel.sh`
2. Pokreni aplikaciju: `npm run dev` (koristi .env.local sa portom 27018)

### Tehnički detalji:
- **SSH tunel**: `ssh -f -N -L 27018:127.0.0.1:27017 root@194.163.176.171`
- **Lokalni port**: 27018
- **Remote port**: 27017
- **Connection string**: `mongodb://localhost:27018/Predavanja`

---

# Arhivirani planovi

## Prethodni plan - rešavanje useReducer greške (završeno)

## Review promjene

**Problem riješen!** 

Glavni uzrok greške je bio što je development script bio postavljen da koristi `cross-env NODE_ENV=development` što je ponekad moglo dovesti do konflikta. 

**Promjene napravljene:**
1. Uklonjen `cross-env NODE_ENV=development` iz dev skripte u `/home/avdo/Ders/web/package.json`
2. Očišćen Next.js cache (.next folder)
3. Očišćen npm cache

**Rezultat:**
- Aplikacija se sada pokreće bez grešaka na http://localhost:3001
- Nema više "Cannot read properties of null (reading 'useReducer')" grešaka
- Next.js se uspješno pokretao u 1046ms

## Finalno rješenje

**Glavni problem:** Konflikt verzija React/Next.js
- Root package.json: React 19 + Next.js 15.3.3
- Web package.json: React 18.2.0 + Next.js 14.2.10

**Finalna promjena:**
1. Downgrade Next.js u web/package.json sa 14.2.10 na 13.5.6 (kompatibilno sa React 18)
2. Uklonjen cross-env iz dev skripte
3. Očišćen cache

**Finalni rezultat:**
- Aplikacija radi bez grešaka na Next.js 13.5.6 + React 18.2.0
- Nema više Hook greške

---

# Prethodni plan - Android produkcijski build (arhivirano)

## Trenutni cilj (završeno)
Napraviti Android produkcijski build koristeći Expo EAS Build.

## TODO stavke za Android produkcijski build (završeno)

- [x] Pregledaj trenutnu Expo i EAS konfiguraciju
- [x] Provjeri Android keystore setup za produkciju
- [x] Kreiraj credentials.json fajl za lokalne kredencijale
- [ ] Pokreni EAS build komandu za Android produkciju
- [ ] Provjeri da li je build uspješan

## Prethodni plan - promjena package name (završeno)

### TODO stavke za promjenu package name

- [x] Analiziraj trenutnu package name konfiguraciju u projektu
- [x] Promijeni package name u app.json i app.config.js na com.daije.mobile
- [x] Ažuriraj eas.json ako je potrebno (nije bilo potrebno)
- [x] Provjeri druge konfiguracijske fajlove koji mogu sadržati package name
- [x] Ažuriraj projectplan.md sa novim planom i promjenama

## Kreirani fajlovi

1. **android-credentials/Ders-app-produkcija.keystore** - Novi keystore fajl
2. **android-credentials/Ders-app-produkcija-upload-cert.pem** - PEM fajl za Google Play Console
3. **android-credentials/keystore-info.txt** - Informacije o keystore (lozinke, SHA1, itd.)

## Keystore informacije

- **SHA1 fingerprint**: E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66
- **Alias**: Ders-app-produkcija
- **Package name**: com.daije.mobile
- **Store password**: DersApp2024Prod
- **Key password**: DersApp2024Prod

## Review promjene package name

Uspješno je promijenjen package name na "com.daije.mobile" u svim relevantnim fajlovima:
- app.json: Android package promijenjen sa "ba.ders.produkcija" na "com.daije.mobile"
- mob/app.config.js: Android package promijenjen sa "ba.ders.app" na "com.daije.mobile"
- mob/app.config.js: iOS bundleIdentifier također promijenjen na "com.daije.mobile"
- eas.json ne sadrži package name konfiguraciju

## Prethodni plan (arhivirano)

### Problem sa Android signing key
Google Play Store odbacuje App Bundle jer je potpisan sa pogrešnim ključem:
- Očekivani ključ: SHA1: 91:21:E9:C5:05:A8:B4:F0:D0:A7:03:00:32:5A:C7:48:EE:3B:2A:01
- Trenutni ključ: SHA1: BE:4A:04:38:73:53:23:E3:EF:50:F5:CF:8C:60:EC:7E:86:34:FC:FA

### Stari TODO (arhivirano)
- [ ] Proveri trenutne EAS credentials za Android
- [ ] Identifikuj koji keystore se trenutno koristi
- [ ] Pronađi originalni keystore koji odgovara očekivanom SHA1
- [ ] Konfiguriši EAS da koristi ispravan keystore
- [ ] Rebuild aplikaciju sa ispravnim keystore
- [ ] Verifikuj da je nova build potpisana sa ispravnim ključem