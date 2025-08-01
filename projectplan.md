# Plan za vraćanje prikaza podataka iz produkcijske baze

## Problem
Web aplikacija trenutno prikazuje samo jedno predavanje umjesto svih predavanja iz produkcijske baze koja sadrži puno podataka.

## Analiza
1. **Frontend konfiguracija**: 
   - Web aplikacija koristi `NEXT_PUBLIC_API_URL=https://ders.ba/api` i za development i za produkciju
   - ElementPage.jsx poziva `predavanjaService.getAllPredavanja()` sa parametrima (page=1, limit=1000, status='all')
   - API poziv ide na `/lectures/public` endpoint

2. **Backend analiza**:
   - Server ruta `/lectures/public` ima složenu logiku za filtriranje i vraćanje podataka
   - Postoje debug logovi koji pokazuju da se podaci učitavaju iz baze
   - SSH tunel se ne koristi direktno u kodu - vjerovatno je konfigurisan na sistem nivou

## TODO Lista

- [x] 1. Provjeriti nginx konfiguraciju na serveru da vidimo kako se rutiraju API pozivi
- [x] 2. Provjeriti da li postoji SSH tunel konfiguracija na serveru
- [x] 3. Testirati direktni API poziv na https://ders.ba/api/lectures/public
- [x] 4. Analizirati response i vidjeti koliko predavanja se vraća
- [x] 5. Provjeriti MongoDB konekciju na serveru i broj dokumenata u kolekciji
- [x] 6. Dodati dodatne debug logove ako je potrebno
- [x] 7. Ispraviti problem sa prikazom podataka
- [x] 8. Testirati da li se sva predavanja prikazuju na web stranici

## Rješenje
Problem je bio što je lokalna aplikacija bila povezana na lokalnu MongoDB bazu koja ima samo 1 testno predavanje, umjesto na produkcijsku bazu sa 46 predavanja.

### Koraci rješavanja:
1. Identifikovan je problem - lokalna baza umjesto produkcijske
2. Kreiran je SSH tunel: `ssh -L 27019:localhost:27017 root@194.163.176.171 -N -f`
3. Ažurirana je MongoDB konekcija da koristi port 27019
4. Aplikacija sada prikazuje svih 46 predavanja iz produkcijske baze

## Review
- Status: ZAVRŠENO
- Svi podaci se sada prikazuju ispravno
- Pagination radi kako treba (3 stranice sa po 20 predavanja)
- SSH tunel omogućava siguran pristup produkcijskoj bazi tokom developmenta