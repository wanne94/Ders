# Plan za rješavanje Xcode Build Phase upozorenja

## Problem
Xcode prikazuje 33 upozorenja vezana za build phase skripte koje se izvršavaju pri svakom build-u jer nemaju definirane output fajlove.

## Analiza
Sva upozorenja su vezana za React Native i povezane biblioteke koje koriste "Create Symlinks to Header Folders" skripte bez definiranih output-a.

## TODO Lista

### ✅ 1. Kreirati suppression config fajl
- Kreirati WarningSuppressions.xcconfig sa postavkama za potiskivanje upozorenja
- Omogućiti kontrolu nad build upozorenjima

### ✅ 2. Ažurirati Podfile sa post_install hook-om  
- Dodati skriptu koja automatski postavlja "Based on dependency analysis" na false
- Primjeniti na sve React Native i povezane pod targete
- NAPOMENA: Pokušao sam postaviti `always_out_of_date` atribut ali Cocoapods ne podržava ovu opciju direktno

### ☐ 3. Testirati build proces
- Provjeriti da li su upozorenja uklonjena
- Potvrditi da build i dalje radi ispravno

### ☐ 4. Dokumentovati promjene
- Objasniti razlog promjena
- Dokumentovati koje postavke su promijenjene

## Napomena
- Pod install je uspješno završen
- Xcode developer tools nisu potpuno konfigurisani (potreban je full Xcode, ne samo Command Line Tools)
- Upozorenja o DEFINES_MODULE su normalna za expo-dev-menu i ne utiču na funkcionalnost

## Review
Promjene napravljene u Podfile-u:
- Dodate postavke za potiskivanje upozorenja iz third-party biblioteka
- Pokušan pristup sa `always_out_of_date` ali nije podržan direktno kroz Cocoapods API
- Potrebno je ručno podesiti u Xcode projektu ili koristiti drugi pristup