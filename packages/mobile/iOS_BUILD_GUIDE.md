# iOS Production Build Guide (Lokalno bez Expo)

## Preduslovi

1. **Xcode** - Instaliran i potpuno konfigurisan
2. **Apple Developer Account** - Za signing i distribuciju ($99/godišnje)
3. **Provisioning Profiles** - Kreirani na Apple Developer Portal

## Koraci za Build

### 1. Prebuild Native iOS Projekat

```bash
cd mob
npx expo prebuild --platform ios --clean
```

### 2. Otvorite Xcode

```bash
open ios/Ders.xcworkspace
```

### 3. Konfiguriši Signing u Xcode

1. Selektuj "Ders" projekat u navigatoru
2. Idi na "Signing & Capabilities" tab
3. Odaberi svoj Team (Apple Developer Account)
4. Xcode će automatski kreirati provisioning profile

### 4. Build Archive

#### Opcija A: Kroz Xcode UI
1. Selektuj "Any iOS Device" kao destination
2. Product → Archive
3. Sačekaj da se build završi

#### Opcija B: Kroz Terminal
```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
xcodebuild -workspace ios/Ders.xcworkspace \
    -scheme Ders \
    -configuration Release \
    -archivePath ios/build/Ders.xcarchive \
    -allowProvisioningUpdates \
    archive
```

### 5. Export IPA za App Store

#### Opcija A: Kroz Xcode Organizer
1. Window → Organizer
2. Selektuj arhivu
3. Click "Distribute App"
4. Odaberi "App Store Connect"
5. Sledi korake

#### Opcija B: Kroz Terminal
```bash
xcodebuild -exportArchive \
    -archivePath ios/build/Ders.xcarchive \
    -exportPath ios/build \
    -exportOptionsPlist ios/ExportOptions.plist \
    -allowProvisioningUpdates
```

### 6. Upload na App Store Connect

#### Opcija A: Transporter App
1. Preuzmi Transporter sa Mac App Store
2. Otvori Transporter
3. Drag & drop IPA fajl
4. Upload

#### Opcija B: Xcode
- Automatski kroz Distribute App process

#### Opcija C: altool (Terminal)
```bash
xcrun altool --upload-app \
    -f ios/build/Ders.ipa \
    -u YOUR_APPLE_ID \
    -p YOUR_APP_SPECIFIC_PASSWORD
```

## Konfiguracija ExportOptions.plist

Updateuj `ios/ExportOptions.plist` sa svojim podacima:

```xml
<key>teamID</key>
<string>YOUR_TEAM_ID</string>

<key>provisioningProfiles</key>
<dict>
    <key>com.daije.mobile</key>
    <string>YOUR_PROVISIONING_PROFILE_NAME</string>
</dict>
```

## Pronađi svoj Team ID

```bash
# U Xcode Organizer
# Ili na developer.apple.com pod Membership
```

## Troubleshooting

### Problem: Code signing error
**Rješenje:** Provjeri da imaš valjan Apple Developer account i da si prijavljen u Xcode

### Problem: Provisioning profile not found
**Rješenje:** 
```bash
# Refresh profiles
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
xcodebuild -allowProvisioningUpdates
```

### Problem: Build failed sa "No account for team"
**Rješenje:** Xcode → Preferences → Accounts → Dodaj svoj Apple ID

## Automatizovan Build Script

Koristi priloženi `build-ios-production.sh` script:

```bash
cd mob
./build-ios-production.sh
```

## Provjera Build-a

```bash
# Provjeri da li je IPA kreiran
ls -la ios/build/*.ipa

# Provjeri info o IPA
unzip -l ios/build/Ders.ipa | head -20
```

## Production Environment

Uvjeri se da su production env varijable postavljene:
- `NODE_ENV=production`
- `EXPO_ENV=production`

## Bundle Identifier
- Current: `com.daije.mobile`
- Version: 1.1.6
- Build: 1

## Napomene

- Prvi put build može trajati 10-15 minuta
- Archive size će biti oko 50-100MB
- IPA fajl će biti u `ios/build/` direktoriju
- Za TestFlight, upload kroz App Store Connect