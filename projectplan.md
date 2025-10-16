# Popravka Apple App Store Review - Permission Descriptions

## Problem
Apple je odbio app zbog nedovoljno jasnih permission description stringova (Guideline 5.1.1).

**Poruka od Apple:**
> "One or more purpose strings in the app do not sufficiently explain the use of protected resources. Purpose strings must clearly and completely describe the app's use of data and, in most cases, provide an example of how the data will be used."

## Analiza
Korišćene biblioteke koje zahtijevaju permisije:
- **expo-image-picker** → Photo Library + Camera (biblioteka može pozvati kameru iako se trenutno ne koristi aktivno)
- **expo-calendar** → Calendar Access

Trenutne permisije u app.config.js:
- ✅ NSPhotoLibraryUsageDescription - postoji ali nije dovoljno jasan
- ✅ NSCalendarsUsageDescription - postoji
- ✅ NSCalendarsFullAccessUsageDescription - postoji
- ❌ **NSCameraUsageDescription - NEDOSTAJE!**

## Rješenje
Dodati NSCameraUsageDescription i poboljšati postojeće opise sa jasnijim i detaljnijim objašnjenjima koja uključuju konkretne primjere korištenja.

## Todo Lista

### [✅] 1. Dodati NSCameraUsageDescription permission
- Dodati jasan opis zašto app može tražiti pristup kameri
- Uključiti konkretan primjer: "fotografisanje slika profila daija, organizacija i predavanja"
- Lokacija: packages/mobile/app.config.js

### [✅] 2. Poboljšati NSPhotoLibraryUsageDescription
- Proširiti opis sa konkretnijim primjerom korištenja
- Format: "[App] koristi galeriju fotografija da [konkretna akcija]. Na primjer, [konkretan primjer]."
- Lokacija: packages/mobile/app.config.js

### [✅] 3. Provjeriti i po potrebi poboljšati Calendar descriptions
- Provjeriti NSCalendarsUsageDescription i NSCalendarsFullAccessUsageDescription
- Dodati konkretnije primjere ako treba
- Lokacija: packages/mobile/app.config.js

### [✅] 4. Povećati buildNumber
- Trenutni buildNumber: 26
- Novi buildNumber: 27
- Lokacija: packages/mobile/app.config.js

### [✅] 5. Ažurirati root app.json
- Sinhronizovati buildNumber u root app.json
- Novi buildNumber: 37 → 38
- Lokacija: /Users/wanne/react-app/Ders/app.json

### [✅] 6. Prebuild i verifikacija
- Pokrenuti `cd packages/mobile && npx expo prebuild --platform ios`
- Provjeriti ios/Ders/Info.plist da su sve permisije pravilno upisane
- Verifikovati da NSCameraUsageDescription postoji u Info.plist

---

## Review Sekcija

### Izvršene izmjene:

#### 1. **app.config.js** (packages/mobile/app.config.js)
   - ✅ **Dodato**: NSCameraUsageDescription sa jasnim objašnjenjem i primjerom
   - ✅ **Poboljšano**: NSPhotoLibraryUsageDescription sa detaljnijim objašnjenjem i konkretnim primjerom
   - ✅ **Poboljšano**: NSCalendarsUsageDescription sa dodatnim primjerom (notifikacija 15 minuta prije)
   - ✅ **Poboljšano**: NSCalendarsFullAccessUsageDescription sa dodatnim primjerom
   - ✅ **Povećano**: buildNumber sa 26 na 27

#### 2. **app.json** (root)
   - ✅ **Povećano**: ios.buildNumber sa 37 na 38

#### 3. **Info.plist** (packages/mobile/ios/Ders/Info.plist)
   - ✅ **Dodato**: NSCameraUsageDescription
   - ✅ **Dodato**: NSPhotoLibraryUsageDescription
   - ✅ **Dodato**: NSCalendarsUsageDescription
   - ✅ **Dodato**: NSCalendarsFullAccessUsageDescription
   - ✅ **Dodato**: ITSAppUsesNonExemptEncryption = false

### Nove permission descriptions:

**NSCameraUsageDescription:**
> "Ders koristi kameru da fotografišete slike profila daija, organizacija i predavanja. Na primjer, možete direktno fotografisati sliku umjesto da je birate iz galerije."

**NSPhotoLibraryUsageDescription:**
> "Ders koristi galeriju fotografija da odaberete i učitate slike profila daija, organizacija i predavanja. Na primjer, možete odabrati postojeću fotografiju sa vašeg uređaja za sliku profila daije."

**NSCalendarsUsageDescription:**
> "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili automatske podsjetnike prije početka. Na primjer, kada dodate predavanje u kalendar, primit ćete notifikaciju 15 minuta prije početka."

**NSCalendarsFullAccessUsageDescription:**
> "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili automatske podsjetnike prije početka. Na primjer, kada dodate predavanje u kalendar, primit ćete notifikaciju 15 minuta prije početka."

### Status:
✅ **SVE IZMJENE SU ZAVRŠENE**

Aplikacija sada ima:
- Sve potrebne permission descriptions sa jasnim objašnjenjima i konkretnim primjerima
- Povećan buildNumber (27 u app.config.js, 38 u root app.json)
- Sve permisije pravilno upisane u ios/Ders/Info.plist

### Sljedeći koraci:
1. Build iOS aplikacije: `cd packages/mobile && eas build --platform ios --local`
2. Upload na App Store Connect
3. Ponovno podnošenje za review

Promjene adresiraju Apple-ov zahtjev za jasnije i detaljnije permission descriptions prema Guideline 5.1.1.
