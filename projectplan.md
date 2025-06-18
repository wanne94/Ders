# Plan za kreiranje novih Android kredencijala za produkciju

## Trenutni cilj
Kreirati nove Android kredencijale za produkciju pod nazivom "Ders-app-produkcija" i generisati PEM fajl za Google Play Console.

## TODO stavke za kreiranje novih kredencijala

- [x] Proveri trenutnu EAS credentials postavku
- [x] Kreiraj nove Android kredencijale sa nazivom "Ders-app-produkcija"
- [x] Generiši PEM fajl iz keystore za Google Play upload key
- [x] Sačuvaj PEM fajl i pripremi instrukcije za Google Play Console
- [x] Ažuriraj app.json sa novim Android package name (ba.ders.produkcija)

## Kreirani fajlovi

1. **android-credentials/Ders-app-produkcija.keystore** - Novi keystore fajl
2. **android-credentials/Ders-app-produkcija-upload-cert.pem** - PEM fajl za Google Play Console
3. **android-credentials/keystore-info.txt** - Informacije o keystore (lozinke, SHA1, itd.)

## Keystore informacije

- **SHA1 fingerprint**: E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66
- **Alias**: Ders-app-produkcija
- **Package name**: ba.ders.produkcija
- **Store password**: DersApp2024Prod
- **Key password**: DersApp2024Prod

## Prethodni TODO (završeno)

- [x] Proveri trenutne Expo konfiguracijske fajlove (app.json, eas.json)
- [x] Ukloni Android-specifične kredencijale iz app.json
- [x] Android build konfiguracija nije pronađena u eas.json (već je generička)
- [x] Proveri i obriši sve Android keystore fajlove (nisu pronađeni)
- [x] Ažuriraj projectplan.md sa završenim zadacima

## Review

Uspešno su uklonjeni svi Android kredencijali iz Expo produkcijske konfiguracije:
- Uklonjena je `android` sekcija iz app.json koja je sadržala package name "ders.ba"
- eas.json ne sadrži Android-specifične kredencijale, samo generičku build konfiguraciju
- Nisu pronađeni nikakvi .keystore fajlovi u projektu
- Expo projektni ID ostaje u konfiguraciji jer nije Android-specifičan

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