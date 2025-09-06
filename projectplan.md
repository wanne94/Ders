# Promjena verzije aplikacije i build produkcije bez Expo

## Problem
Potrebno je promijeniti verziju aplikacije za Play Store i izvršiti lokalni build produkcije bez korišćenja Expo servisa.

## Plan izvršavanja

### Todo stavke:
- [ ] Analiziraj trenutnu strukturu projekta i konfiguracijske fajlove
- [ ] Promijeni verziju aplikacije za Play Store  
- [ ] Pripremi build konfiguraciju za produkciju bez Expo
- [ ] Izvrši lokalni build produkcije

### Detaljan opis:

1. **Analiza strukture** - Provjeri app.json/app.config.js, package.json i Android specifične fajlove
2. **Promjena verzije** - Ažuriraj version i versionCode u odgovarajućim fajlovima
3. **Build konfiguracija** - Osiguraj da su svi potrebni parametri podešeni za lokalni build
4. **Lokalni build** - Kreiraj produkcijski APK/AAB fajl

## Review sekcija

### Izvršene promjene:

✅ **Analiza projekta završena** - Identificirani svi konfiguracijski fajlovi:
- `app.config.js` - glavna Expo konfiguracija 
- `package.json` - npm dependencies i scripts
- `android/app/build.gradle` - Android build konfiguracija
- `android/gradle.properties` - Gradle svojstva i keystore

✅ **Verzija aplikacije ažurirana** sa 1.1.5 na 1.1.6:
- `app.config.js`: version "1.1.6", versionCode 20
- `android/app/build.gradle`: versionName "1.1.6", versionCode 20
- `package.json`: version "1.1.6"

✅ **Build konfiguracija pripremljena** - potvrđeno da su:
- Keystore i kredencijali konfigurisani (`Ders-app-produkcija.keystore`)
- Gradle 8.13 instaliran i funkcionalan
- Android SDK i build tools dostupni
- Proguard i optimizacije omogućene

✅ **Lokalni build uspješno izvršen**:
- **APK**: `/home/avdo/Ders/mob/android/app/build/outputs/apk/release/app-release.apk` (70MB)
- **AAB**: `/home/avdo/Ders/mob/android/app/build/outputs/bundle/release/app-release.aab` (48MB)

### Tehnički detalji:
- Build izvršen direktno preko Gradle bez EAS servisa
- Korišćen production keystore za potpis
- Hermes engine omogućen
- ProGuard optimizacije aktivne  
- Nova arhitektura (New Architecture) omogućena
- Metro bundler uspješno kompajlirao 1919 modula

### Fajlovi spremni za distribuciju:
1. `app-release.apk` - za direktnu instalaciju ili testing
2. `app-release.aab` - za upload na Google Play Console

Aplikacija je uspješno kompajlirana u verziji 1.1.6 bez korišćenja Expo cloud servisa.