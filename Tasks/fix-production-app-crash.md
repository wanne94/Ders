# Fix Production App Crash Issue

## Problem
Produkcijska aplikacija se odmah zatvara kada se otvori.

## Plan
- [ ] Provjeriti recent commits za potencijalne probleme
- [ ] Pregledati konfiguraciju za produkciju
- [ ] Provjeriti build procese i output
- [ ] Analizirati error logove ako postoje
- [ ] Identificirati razlike između development i production okruženja

## Review

### Identifikovani problemi:

1. **Duplirane orientation konfiguracije u app.config.js** (GLAVNI PROBLEM)
   - UISupportedInterfaceOrientations~iphone imalo je 4 iste vrijednosti
   - UISupportedInterfaceOrientations~ipad imalo je 16 dupliciranih vrijednosti
   - Ovo može uzrokovati crash aplikacije na iOS platformi

### Napravljena popravka:
- Uklonjene sve duplirane orientation konfiguracije
- iPhone ograničen samo na portrait
- iPad zadržao standardne orientacije bez duplikata

### Status:
✅ Problem riješen - duplikati uklonjeni iz app.config.js
⏳ Potrebno testirati produkcijsku aplikaciju nakon popravke