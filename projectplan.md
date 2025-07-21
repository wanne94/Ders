# Plan: Popravka Android App Bundle Signing Configuration

## Problem
Android App Bundle je potpisan sa pogrešnim certificate-om. Google Play Store očekuje SHA1 fingerprint `E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66` ali je korišten `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.

## Uzrok
U `/home/avdo/Ders/mob/android/app/build.gradle` fajlu, release signing konfiguracija koristi debug keystore umjesto produkcijske keystore.

## TODO lista:

- [x] 1. Ažurirati release signing configuration da koristi produkcijski keystore
- [x] 2. Verifikacija da produkcijski keystore postoji i da su credentials ispravni
- [x] 3. Testiranje local Android build sa novom signing konfiguracijom
- [x] 4. Kreiranje novog AAB fajla sa ispravnim potpisom
- [x] 5. Verifikacija fingerprint-a novog build-a

## Dostupni resursi
- **Produkcijski keystore**: `/home/avdo/Ders/mob/android-credentials/Ders-app-produkcija.keystore`
- **Keystore password**: `DersApp2024Prod`
- **Key alias**: `Ders-app-produkcija`
- **Key password**: `DersApp2024Prod`

## Trenutno stanje
- **Release build sada koristi produkcijski keystore ✅**
- **Novi AAB fajl sa ispravnim potpisom kreiran ✅**
- **SHA1 fingerprint se poklopio sa Google Play zahtjevom ✅**

## Review sekcija

### Promjene napravljene:

1. **Ispravljena signing konfiguracija** u `/home/avdo/Ders/mob/android/app/build.gradle:106-110`:
   - Promjenjena putanja sa `debug.keystore` na `../../android-credentials/Ders-app-produkcija.keystore`
   - Ažurirani credentials: storePassword, keyAlias, keyPassword

2. **Popravljen package name mismatch**:
   - Promjenjen package u `MainActivity.kt` i `MainApplication.kt` sa `com.wanne.mobileapp` na `com.daije.mobile`
   - Premješteni fajlovi u odgovarajuću folder strukturu

3. **Uspješan production build**:
   - Kreiran novi AAB: `/home/avdo/Ders/mob/builds/app-release-signed-1.0.6-9.aab`
   - SHA1 fingerprint: `E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66`

### Rezultat:
**✅ Problem riješen!** 
Android App Bundle je sada potpisan sa ispravnim production certificate-om. SHA1 fingerprint se tačno poklopio sa onim što Google Play Store očekuje (`E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66`). AAB fajl je spreman za upload na Google Play Store.