# Plan za ažuriranje Android Target SDK na API level 35

## TODO lista:

- [ ] 1. Ažurirati targetSdkVersion sa 34 na 35 u gradle.properties
- [ ] 2. Provjeriti da li compileSdkVersion već odgovara (35)
- [ ] 3. Testirati build aplikacije lokalno
- [ ] 4. Pregledati da li postoje deprecation upozorenja ili problemi sa kompatibilnošću
- [ ] 5. Ažurirati versionCode i versionName u build.gradle (app level)
- [ ] 6. Pripremiti aplikaciju za release

## Napomene:
- Google Play zahtijeva da aplikacije targetiraju Android 15 (API level 35) do 31. avgusta 2025.
- Trenutno aplikacija targetira API level 34, što neće biti dovoljno nakon roka
- CompileSdkVersion već je postavljen na 35, što je dobro