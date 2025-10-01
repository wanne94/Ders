# Plan za rješavanje App Store Upload grešaka

## ✅ ZAVRŠENE IZMJENE ZA EAS BUILD

### Identifikovani problemi (iz Transporter loga):
1. ❌ **CFBundleShortVersionString** - verzija 1.0.0 mora biti veća od 1.0.4
2. ❌ **Build broj konflikt** - build sa brojem "2" je premali
3. ❌ **Device compatibility** - aplikacija mora podržavati sve uređaje

### Status: RIJEŠENO ✅

## Ažurirane verzije (na osnovu zadnje uploadovane 1.2.0 build 28):

### 1. **Info.plist** (`packages/mobile/ios/Ders/Info.plist`)
   - CFBundleShortVersionString: **1.2.1** ✅
   - CFBundleVersion: **29** ✅

### 2. **app.json** (root folder)
   - ios.buildNumber: **29** ✅

### 3. **Targeted Device Family**
   - TARGETED_DEVICE_FAMILY = "1,2" (iPhone i iPad) ✅

## Kada koristiš EAS build --local za iOS:

### Konfiguracija verzija:

#### 1. **app.json / app.config.js** (Primarna lokacija)
```json
{
  "expo": {
    "version": "1.2.1",  // CFBundleShortVersionString
    "ios": {
      "buildNumber": "29",  // CFBundleVersion
      "bundleIdentifier": "com.daije.mobile"
    }
  }
}
```

#### 2. **Info.plist** (Ako postoji ios/ folder nakon prebuild)
- CFBundleShortVersionString: 1.2.1
- CFBundleVersion: 29

#### 3. **eas.json** konfiguracija
```json
{
  "cli": {
    "appVersionSource": "local"  // Koristi lokalne verzije iz app.json
  }
}
```

## Komande za build:

1. **Sinkronizacija verzija (opciono):**
   ```bash
   npx expo prebuild --clean
   ```

2. **Lokalni EAS build za iOS:**
   ```bash
   eas build --platform ios --local
   ```

## Status:
✅ **SVE VERZIJE SU ISPRAVNO POSTAVLJENE I SPREMNE ZA BUILD!**

Aplikacija će imati:
- Verziju **1.2.1** (veća od zadnje uploadovane 1.2.0)
- Build broj **29** (veći od zadnjeg 28)
- Podršku za iPhone i iPad