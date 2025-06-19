# Plan za Android produkcijski build

## Trenutni cilj
Napraviti Android produkcijski build koristeći Expo EAS Build.

## TODO stavke za Android produkcijski build

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