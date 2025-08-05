# Plan za promjenu verzija aplikacije i buildanje AAB fajla

## TODO Lista:

1. [x] Promijeniti verziju u package.json fajlu (trenutno 1.1.0)
2. [x] Promijeniti versionCode i versionName u android/app/build.gradle (trenutno versionCode: 15, versionName: 1.1.2)
3. [x] Provjeriti da li postoje sve potrebne konfiguracije za build
4. [x] Pokrenuti build AAB komandu lokalno
5. [x] Provjeriti da li je AAB fajl uspješno kreiran

## Napomene:
- Trenutne verzije: package.json (1.1.0), Android versionCode (15), Android versionName (1.1.2)
- Build komanda već postoji u package.json: `npm run build-aab`
- AAB fajl će biti generisan u android/app/build/outputs/bundle/release/

## Review

### Promjene koje su napravljene:
1. **Promijenjena verzija u package.json** - Sa 1.1.0 na 1.1.3
2. **Promijenjen versionCode u Android build.gradle** - Sa 15 na 16
3. **Promijenjena versionName u Android build.gradle** - Sa 1.1.2 na 1.1.3
4. **Uspješno buildovan AAB fajl** - Kreiran app-release.aab (veličina: 49.5 MB)

### Rezultat:
- AAB fajl je uspješno kreiran na lokaciji: `/home/avdo/Ders/mob/android/app/build/outputs/bundle/release/app-release.aab`
- Fajl je spreman za upload na Google Play Store
- Build proces je prošao bez grešaka