# Instrukcije za Android Production Build

## Problem
EAS koristi default keystore umesto našeg lokalnog keystore-a "Ders-app-produkcija".

## Rešenje - Opcija 1: Upload keystore kroz EAS Dashboard
1. Idi na: https://expo.dev/accounts/wanne/projects/ders-app/credentials
2. Klikni na "Android" → "Production" 
3. Upload keystore fajl: `android-credentials/Ders-app-produkcija.keystore`
4. Unesi credentials:
   - Keystore password: DersApp2024Prod
   - Key alias: Ders-app-produkcija
   - Key password: DersApp2024Prod
5. Pokreni build ponovo

## Rešenje - Opcija 2: Lokalni build
```bash
# Instaliraj EAS CLI lokalno ako treba
npm install -g eas-cli

# Pokreni lokalni build
eas build --platform android --profile production --local
```

## Keystore informacije
- SHA1: E8:70:28:1F:50:76:FA:22:B4:D9:47:FF:DB:1E:21:76:90:78:FE:66
- Ovo je SHA1 koji Google Play očekuje!