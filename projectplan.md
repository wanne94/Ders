# Plan za pokretanje produkcijskog build-a na Expo Cloud za Android

## TODO stavke:

- [x] Proveriti da li je EAS CLI instaliran i konfigurisan
- [x] Proveriti trenutni status EAS projekta i poslednje build-ove
- [x] Proveriti da li su sve promene commit-ovane (git status) - IMA NECOMMIT-OVANIH PROMENA
- [x] Ažurirati verziju aplikacije ako je potrebno - Trenutna verzija je 1.0.0
- [x] Pokrenuti produkcijski build komandu za Android - PROBLEM: Zahteva interaktivni unos za Android Keystore
- [ ] Pratiti progres build-a na Expo Cloud-u

## Napomene:
- Projekat koristi Expo SDK 53 sa CNG pristupom
- Postoje dva EAS project ID-ja (root i mob folder)
- Production profil koristi app-bundle format za Android
- Environment varijable su već konfigurisane u eas.json

## Review sekcija:
- EAS CLI je instaliran (verzija 16.10.1) i autentifikovan kao "wanne"
- Postoje necommit-ovane promene u projektu koje bi trebalo commit-ovati pre build-a
- Trenutna verzija aplikacije je 1.0.0
- Build komanda zahteva interaktivni unos za generisanje Android Keystore-a
- Nije moguće pokrenuti build bez interaktivnog pristupa terminalu

## Preporuke:
1. Prvo commit-ovati sve promene: `git add . && git commit -m "Prepare for production build"`
2. Zatim pokrenuti build komandu interaktivno: `eas build --platform android --profile production`
3. Kada se pojavi pitanje o Keystore-u, odabrati opciju za generisanje novog
4. Build će se pokrenuti na Expo Cloud-u i moći ćete da pratite progres na web stranici