# Plan za deployment web aplikacije i git push

## TODO Lista

- [x] 1. Provjeriti trenutno stanje git repozitorija
- [x] 2. Build-ovati web aplikaciju za produkciju
- [x] 3. Provjeriti da li postoje greške u build procesu
- [x] 4. Dodati sve izmjene u git staging
- [x] 5. Kreirati commit sa opisom izmjena
- [ ] 6. Push-ovati izmjene na remote repozitorij (u toku - rješavanje konflikta)
- [ ] 7. Verifikovati da je push uspješan

## Tehničke napomene

- Web aplikacija se nalazi u /web direktoriju
- Koristiti npm run build za produkcijski build
- Provjeriti da li postoje environment varijable za produkciju

## Review sekcija

### Završene akcije:
1. Provjereno git stanje - lokalna grana je iza remote za 1 commit
2. Build web aplikacije uspješno završen sa samo upozorenjima (nema grešaka)
3. Sve izmjene dodane u staging
4. Kreiran commit sa opisom izmjena
5. U toku je rješavanje merge konflikta sa remote branch