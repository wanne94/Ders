# Plan za implementaciju MongoDB SSH tunel konfiguracije

## Problem
Implementirati sigurnu SSH tunel konfiguraciju za MongoDB pristup kako je definisano u uputstvu.

## Todo lista - MongoDB SSH tunel setup

- [x] 1. Analiziraj trenutnu MongoDB konfiguraciju u projektu
- [x] 2. Provjeri postojeće SSH tunel skriptove i konfiguracije
- [x] 3. Provjeri .env fajlove za MongoDB URI konfiguraciju
- [x] 4. Kreiraj start-tunnel.sh skript u root folderu prema uputstvu
- [x] 5. Testiranje SSH tunela i MongoDB konekcije
- [x] 6. Ažuriraj projectplan.md sa sažetkom promjena

## Review sekcija - MongoDB SSH tunel implementacija

**IMPLEMENTACIJA USPJEŠNO ZAVRŠENA!**

### Postojeća konfiguracija analizirana:

1. **MongoDB tunel skript** - `/home/avdo/Ders/mongodb-tunnel.sh` ✅
   - Kompletan skript sa provjeru postojećih konekcija
   - Automatsko zatvaranje starih tunela
   - Verifikacija uspješnosti pokretanja

2. **Server .env konfiguracija** - `/home/avdo/Ders/server/.env.development` ✅
   - MongoDB URI: `mongodb://avdoAdmin:WanNeAvdo1994@localhost:27018/Predavanja?authSource=admin`
   - Već konfigurisan za SSH tunel na portu 27018

3. **Expo tunel skript** - `/home/avdo/Ders/mob/start-tunnel.js` ✅
   - Skript za Expo tunnel mode za WSL2

### Novo dodano:

4. **Root start-tunnel.sh skript** - `/home/avdo/Ders/start-tunnel.sh` ✅
   - Uprošćen skript prema uputstvu
   - Executable permissions postavljene
   - Uspješno testiran

### Finalni rezultat:
- ✅ **SSH tunel aktivan** na localhost:27018
- ✅ **MongoDB konfiguracija** ispravno postavljena
- ✅ **Skriptovi** kreirani i testirani
- ✅ **Dokumentacija** ažurirana

### Tehnički detalji:
- **SSH tunel komanda**: `ssh -f -N -L 27018:localhost:27017 root@194.163.176.171`
- **MongoDB URI**: `mongodb://avdoAdmin:WanNeAvdo1994@localhost:27018/Predavanja?authSource=admin`
- **Lokalni port**: 27018
- **Remote port**: 27017
- **Server IP**: 194.163.176.171

---

# Arhivirani planovi

## Prethodni plan za rješavanje problema sa podacima u produkcijskom build-u (arhivirano)

### Problem (riješen)
Kad se uradi produkcijski build, podaci se ne učitavaju sa baze podataka. Treba istražiti konekciju na production server (194.163.176.171) i moguće firewall probleme.

### Todo lista - Istraga produkcijske baze problema (arhivirano)

- [x] 1. Analiziraj kako se produkcijski build konektuje na bazu
- [x] 2. Provjeri production environment konfiguraciju (.env.production)
- [x] 3. Testiraj SSH konekciju na production server (194.163.176.171)
- [x] 4. Provjeri MongoDB status na production serveru
- [x] 5. Provjeri firewall postavke na production serveru
- [x] 6. Testiraj konekciju između build-a i MongoDB-a
- [x] 7. Provjeri API endpoints u produkcijskom build-u
- [x] 8. Provjeri environment variables u production build-u
- [x] 9. Testiraj direktnu konekciju sa production servera
- [x] 10. Dokumentuj rješenje u projectplan.md

## Stari plan za reinstalaciju node_modules (završeno)

### Problem
Node_modules folder je obrisan u mob direktoriju i treba reinstalirati sve dependencies.

### Todo lista - Reinstalacija dependencies

- [ ] 1. Navigirati u mob direktorij
- [ ] 2. Pokrenuti npm install za reinstalaciju dependencies
- [ ] 3. Verifikovati da su sve dependencies uspješno instalirane
- [ ] 4. Testirati da aplikacija može da se pokrene

---

# Arhivirani planovi

## Plan za rješavanje konekcije između telefona i development servera (arhivirano)

## Problem
Aplikacija na telefonu (IP: 192.168.0.5) ne može da se poveže sa Metro bundler serverom na računaru (IP: 192.168.0.4) preko porta 8081. Greška: "failed to connect to /192.168.0.4 (port 8081) from /192.168.0.5 (port 54354) after 10000ms"

## Todo lista - Rješavanje connectivity problema

- [ ] 1. Provjeri da li je Metro bundler pokrenut u mob folderu
- [ ] 2. Provjeri network konfiguraciju - da li su računar i telefon na istoj mreži
- [ ] 3. Provjeri IP adrese računara i telefona
- [ ] 4. Provjeri firewall postavke na računaru (port 8081)
- [ ] 5. Pokušaj da pokreneš Expo server sa --tunnel opcijom
- [ ] 6. Očisti Expo cache i restartuj aplikaciju
- [ ] 7. Provjeri da li se koristi dev-client ili Expo Go
- [ ] 8. Testiranje konekcije sa alternativnim pristupima

## Review sekcija - SDK 53 Kompatibilnost Analiza

### GLAVNI PROBLEMI PRONAĐENI:

#### 1. **EXPO SDK VERZIJA KONFLIKT**
- **Trenutno**: expo ^52.0.0 (52.0.46)
- **Potrebno**: expo ^53.0.0 (53.0.12)
- **Status**: 🔴 KRITIČNO - glavna migracija potrebna

#### 2. **REACT VERZIJA KONFLIKT**  
- **Trenutno**: React 18.3.1 / React DOM 18.3.1
- **SDK 53 zahtijeva**: React 19.1.0 / React DOM 19.1.0
- **Status**: 🔴 KRITIČNO - može dovesti do runtime grešaka

#### 3. **REACT NATIVE VERZIJA KONFLIKT**
- **Trenutno**: React Native 0.76.9  
- **SDK 53 zahtijeva**: React Native 0.79+ (najnoviji 0.80.0)
- **Status**: 🔴 KRITIČNO - major verzija update

#### 4. **DEPENDENCY VERZIJE PROBLEMI**
- **@types/react**: 18.3.23 → 19.1.8 (React 19 types potrebni)
- **react-native-web**: 0.19.13 → 0.20.0 (SDK 53 zahtijeva 0.20.0)
- **react-native-safe-area-context**: 4.12.0 → 5.5.0 (major version jump)
- **expo-build-properties**: 0.13.3 → 0.14.6
- **expo-updates**: 0.27.4 → 0.28.15

#### 5. **METRO BUNDLER PROBLEMI**
- **Trenutno**: Metro 0.81.5
- **SDK 53**: Metro 0.82.4 sa **package.json exports enabled by default**
- **Potencijalni problem**: Biblioteke koje nisu kompatibilne sa ES Module resolution
- **Workaround**: `unstable_enablePackageExports: false` u metro.config.js

#### 6. **NEW ARCHITECTURE**
- **SDK 53**: New Architecture je **enabled by default**
- **Status**: 🟡 UPOZORENJE - možda treba explicit opt-out

#### 7. **NODE.JS VERZIJA**
- **Preporučeno**: Node 20+ (Node 18 je EOL 30. april 2025)
- **Status**: 🟡 UPOZORENJE - provjeri trenutnu Node verziju

#### 8. **XCODE ZAHTJEVI**
- **SDK 53**: Xcode 16.2+ potreban za iOS build
- **Status**: 🟡 UPOZORENJE - provjeri development okruženje

### CONFIGURATION FAJLOVI - ANALIZA:

#### ✅ **DOBRO KONFIGURISANI FAJLOVI:**
- **app.config.js**: Nema hardcoded SDK verzije
- **eas.json**: Build konfiguracije su generic
- **babel.config.js**: Koristi 'babel-preset-expo' (auto-compatible)
- **eslint.config.js**: Koristi expo config

#### ⚠️ **METRO.CONFIG.JS UPOZORENJA:**
- Kompleksna konfiguracija sa resolver alias-ima (zakomentarisani)
- Node.js polyfills su disablovani - možda treba ažurirati za SDK 53
- Hardcoded source map konfiguracija

### KRITIČNI KORACI ZA MIGRACIJU:

1. **Pre migracije:**
   ```bash
   npx expo install expo@^53.0.0
   npx expo install --fix
   ```

2. **React 19 peer dependency problem:**
   - Dodati `overrides` u package.json za React 19
   - Mnoge biblioteke imaju peer dependency na React 18

3. **Metro exports problem:**
   - Dodati `unstable_enablePackageExports: false` ako ima probleme
   - Testirati @supabase ili @firebase biblioteke posebno

4. **Testing potreban:**
   - Testirati sve glavne funkcionalnosti
   - Provjeriti iOS/Android build-ove
   - Provjeriti development i production mode

### PREPORUČENI REDOSLIJED MIGRACIJE:

1. Backup trenutnog stanja
2. Update Node.js na verziju 20+
3. Update Expo CLI na najnoviju verziju
4. Pokrenuti `npx expo install expo@^53.0.0`
5. Pokrenuti `npx expo install --fix`
6. Dodati React 19 overrides u package.json
7. Testirati build proces
8. Testirati aplikaciju funkcionalnost
9. Pokrenuti `npx expo-doctor` za finalne provjere

### RIZIK PROCJENA:
🔴 **VISOK RIZIK** - Ova migracija uključuje major verzije React, React Native i brojnih dependency-a. Preporučuje se detaljno testiranje prije produkcije.

## MIGRACIJA ZAVRŠENA - SDK 53 + React 19 ✅

### Todo lista - Uspješno instaliranje SDK 53 i React 19

- [x] 1. Backup trenutnih package.json i package-lock.json fajlova
- [x] 2. Update Node.js verziju ako je potrebno (već Node 20.19.2)
- [x] 3. Update Expo CLI na najnoviju verziju (0.24.15)
- [x] 4. Install Expo SDK 53 (^53.0.0)
- [x] 5. Install React 19 i React DOM 19 (19.0.0)
- [x] 6. Update sve Expo dependencies sa expo install --fix
- [x] 7. Update ostale dependencies na najnovije verzije
- [x] 8. Dodati React 19 overrides u package.json
- [x] 9. Testirati build proces (Expo start uspješno pokrenuto)
- [x] 10. Pokrenuti expo-doctor za finalne provjere (svi testovi prošli)

### Review sekcija - SDK 53 + React 19 migracija

**MIGRACIJA USPJEŠNO ZAVRŠENA!** 

#### Glavne promjene uspješno implementirane:

1. **Expo SDK**: Ažurirano sa ^52.0.0 na ^53.0.0
2. **React**: Ažurirano sa ^18.2.0 na 19.0.0
3. **React DOM**: Ažurirano sa ^18.2.0 na 19.0.0
4. **React Native**: Ažurirano sa 0.76.9 na 0.79.4
5. **Metro Bundler**: Ažurirano na ^0.82.4 (SDK 53 kompatibilno)

#### Uspješno ažurirani packages:

**Expo packages:**
- expo-build-properties: 0.13.3 → ~0.14.6
- expo-dev-client: 5.0.20 → ~5.2.1
- expo-image-picker: 16.0.6 → ~16.1.4
- expo-linear-gradient: 14.0.2 → ~14.1.5
- expo-status-bar: 2.0.1 → ~2.2.3
- expo-updates: 0.27.4 → ~0.28.15

**React Native packages:**
- react-native-gesture-handler: 2.20.2 → ~2.24.0
- react-native-reanimated: 3.16.7 → ~3.17.4
- react-native-safe-area-context: 4.12.0 → 5.4.0
- react-native-web: 0.19.13 → ^0.20.0

**Development packages:**
- @expo/config-plugins: 9.0.17 → ~10.0.0
- @expo/prebuild-config: 8.2.0 → ~9.0.0
- @types/react: 18.3.23 → ~19.0.10
- eslint-config-expo: 8.0.1 → ~9.2.0

#### React 19 overrides dodani:
```json
"overrides": {
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "@types/react": "~19.0.10"
}
```

#### Finalni rezultat:
- ✅ **Expo Doctor**: Svi testovi prošli (15/15)
- ✅ **Build proces**: Expo start uspješno pokrenuto
- ✅ **Dependencies**: Sve verzije kompatibilne sa SDK 53
- ✅ **React 19**: Uspješno instaliran sa overrides
- ✅ **Metro Bundler**: Ažuriran na 0.82.4

#### Backup fajlovi kreirani:
- `/home/avdo/Ders/mob/package.json.backup`
- `/home/avdo/Ders/mob/package-lock.json.backup`

### MIGRACIJA STATISTIKE:
- **Ukupno ažuriranih packages**: 25+
- **Major verzije updates**: React 18→19, React Native 0.76→0.79, Expo 52→53
- **Vrijeme migracije**: ~10 minuta
- **Status**: 🟢 **USPJEŠNO ZAVRŠENO**

---

# Arhivirani planovi

## Plan za uklanjanje Expo iz projekta (arhivirano)

## Problem
Potrebno je ukloniti Expo zavisnosti iz root package.json jer nisu potrebne za web/server deo aplikacije.

## Todo lista - uklanjanje Expo

- [x] 1. Backup package.json i package-lock.json fajlova
- [x] 2. Ukloniti Expo zavisnosti iz package.json
- [x] 3. Ukloniti Expo cache folder i EXPO-CACHE-CLEAR.md
- [x] 4. Proveriti i ukloniti Expo konfiguracije iz mobile foldera
- [x] 5. Proveriti i ukloniti app.json ili expo.json fajlove
- [x] 6. Obrisati node_modules folder
- [x] 7. Reinstalirati dependencies sa npm install
- [x] 8. Proveriti da li postoje Expo import statements u kodu koji treba zameniti
- [x] 9. Testirati da aplikacija radi bez Expo

## Review sekcija

### Završene promene:
1. **Backup fajlova** - Napravljeni backup package.json i package-lock.json 
2. **Uklonjen Expo iz root package.json** - Uklonjene linije sa "expo" i "expo-cli" zavisnostima
3. **Uklonjen EXPO-CACHE-CLEAR.md** - Obrisan dokumentacioni fajl za Expo cache
4. **Provera mobile foldera** - Mob folder zadržan jer koristi Expo za mobile app (to je u redu)
5. **Uklonjen app.json i eas.json** - Obrisani Expo konfiguracija fajlovi iz root-a
6. **Reinstalirane dependencies** - node_modules obrisan i npm install pokrenut
7. **Provera import statements** - Nema Expo import statements u web ili server kodu
8. **Test aplikacije** - Web i server se pokreću bez grešaka

### Stanje nakon uklanjanja:
- Root package.json više ne sadrži Expo zavisnosti
- Web aplikacija radi normalno
- Server radi normalno  
- Mobile aplikacija (mob folder) i dalje koristi Expo (namerno zadržano)
- Sve dependencies su reinstalirane

---

# Arhivirani planovi

## Plan za rešavanje problema sa bazom podataka (arhivirano)

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