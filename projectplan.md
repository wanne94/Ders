# Plan Popravke Problema sa Datumom na Produkciji

## Problem
Kada se odabere datum 22. avgust na produkcijskom serveru (ders.ba), prikazuje se 21. avgust umjesto 22. avgusta. Na lokalhostu sve radi pravilno.

## Analiza Problema
1. **Timezone razlike**: Server koristi Europe/Sarajevo (CEST, +0200) timezone
2. **JavaScript Date objekti**: Kada se kreira Date objekat sa stringom "2025-08-22", JavaScript ga tretira kao UTC midnight (00:00:00 UTC)
3. **Konverzija timezone**: Na produkciji, UTC midnight se konvertuje na prethodni dan kada se prikaže u lokalnoj timezone

## TODO Lista Popravki

- [x] 1. **Analiziraj trenutno stanje koda** ✅
   - Pregledaj kako se datum parsira u LectureForm komponenti
   - Provjeri parseLocalDate funkciju na serveru
   - Identifikuj gdje se gubi dan pri konverziji

- [x] 2. **Popravi parsiranje datuma u frontend komponenti** ✅
   - Modificiraj handleDateChange funkciju da koristi lokalni datum bez UTC konverzije
   - Osiguraj da se datum šalje kao string u formatu YYYY-MM-DD

- [x] 3. **Popravi čuvanje datuma na serveru** ✅
   - Osiguraj da parseLocalDate funkcija postavlja vrijeme na podne (12:00) lokalno
   - Provjeri da li se datum ispravno čuva u MongoDB

- [x] 4. **Testiranje lokalno** ✅
   - Testiraj kreiranje predavanja sa različitim datumima
   - Provjeri da li se datum ispravno prikazuje nakon osvježavanja

- [ ] 5. **Pripremi deployment**
   - Commituj promjene
   - Pripremi za deployment na produkciju

## Tehnički Detalji Rješenja

### Problem sa Date objektom
```javascript
// Problem: 
new Date("2025-08-22") // Tretira se kao UTC midnight
// Na CEST (+0200) timezone, ovo postaje 2025-08-21 22:00

// Rješenje:
new Date(2025, 7, 22) // Mjesec je 0-indexed, ovo kreira lokalni datum
```

### Izmjene koje trebaju biti napravljene:
1. **LectureForm.jsx** - handleDateChange funkcija treba koristiti lokalne metode
2. **dateHelpers.js** - parseLocalDate već ispravno parsira, ali treba provjeriti korištenje
3. **MongoDB čuvanje** - Osigurati da se datum čuva kao lokalni datum sa vremenom na podne

## Review sekcija

### Implementirane promjene:

1. **LectureForm.jsx (linija 254-270)**: 
   - Popravljena handleDateChange funkcija da koristi lokalne Date metode
   - Dodato logovanje za debug

2. **LectureForm.jsx (linija 83-113)**:
   - Poboljšano parsiranje datuma kada se učitava postojeće predavanje
   - Dodato rukovanje ISO format datuma (sa 'T')
   - Ekstraktuje samo datum dio da izbjegne timezone probleme

3. **LectureForm.jsx (linija 656-672)**:
   - DatePicker sada pravilno kreira Date objekat od YYYY-MM-DD stringa
   - Koristi lokalne Date konstruktor sa eksplicitnim satom (12:00)

4. **dateHelpers.js (linija 12-40)**:
   - Poboljšana parseLocalDate funkcija
   - Dodato rukovanje ISO datuma
   - Dodana validacija i logovanje
   - Osigurava da se datum uvijek postavlja na 12:00 lokalno vrijeme

### Ključne izmjene:
- Izbjegnuta implicitna UTC konverzija korištenjem lokalnih Date metoda
- Svi datumi se sada parsiraju sa vremenom postavljenim na 12:00 da se izbjegnu timezone problemi
- Dodano detaljno logovanje za lakše praćenje problema u produkciji