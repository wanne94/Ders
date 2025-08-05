# Build Instrukcije za Ders.ba Mobilnu Aplikaciju

## Lokalni Build (bez Expo servisa)

### Dostupne npm skripte:

#### 1. **Produkcijski APK build**
```bash
npm run build-apk
```
- Kreira optimizovan APK fajl za produkciju
- Lokacija: `android/app/build/outputs/apk/release/app-release.apk`
- Veličina: ~68MB
- Potpisan sa produkcijskim keystore

#### 2. **Produkcijski AAB build** (za Google Play Store)
```bash
npm run build-aab
```
- Kreira Android App Bundle (.aab) fajl
- Lokacija: `android/app/build/outputs/bundle/release/app-release.aab`
- Preporučeno za upload na Google Play Store

#### 3. **Debug APK build**
```bash
npm run build-apk-debug
```
- Kreira debug verziju APK-a
- Lokacija: `android/app/build/outputs/apk/debug/app-debug.apk`
- Za testiranje tokom razvoja

#### 4. **Clean build**
```bash
npm run build-clean
```
- Briše sve prethodne build artefakte
- Koristiti prije novog build-a ako ima problema

#### 5. **Build info**
```bash
npm run build-info
```
- Prikazuje informacije o dependencies

### Keystore informacije:
- Lokacija: `/home/avdo/Ders/android-credentials/Ders-app-produkcija.keystore`
- Alias: `Ders-app-produkcija`
- Konfiguracija: `android/gradle.properties`

### Zahtjevi:
- Android SDK
- Java JDK 11 ili 17
- Node.js 18+
- Gradle 8.x

### Napomene:
- Svi build-ovi se izvršavaju lokalno
- Nema potrebe za Expo/EAS servisima
- Build proces traje 3-5 minuta u zavisnosti od sistema