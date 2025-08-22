# Plan za Popravku DatePicker-a i Postavljanje Defaultnih Vrijednosti

## Problem
1. Na produkciji (ders.ba) kada se odabere datum, uvijek se odabere dan prije
2. Nema defaultnog datuma - treba postaviti današnji dan
3. Nema defaultnog vremena - treba postaviti 12:00h

## TODO Lista

- [x] 1. Analiziraj trenutnu implementaciju DatePicker komponente
  - Pregled LectureForm.jsx 
  - Pregled datePickerUtils.js
  - Identifikuj gdje je problem sa timezone

- [x] 2. Postavi defaultni datum na današnji dan
  - Kada se otvori forma za novi ders
  - Koristi lokalno vrijeme bez UTC konverzije

- [x] 3. Postavi defaultno vrijeme na 12:00h
  - Automatski postavi vrijeme na 12:00 kada se otvori forma

- [x] 4. Popravi problem sa odabirom datuma (dan prije)
  - Osiguraj da se datum parsira u lokalnoj timezone
  - Izbjegni UTC midnight konverziju

- [x] 5. Testiraj promjene lokalno
  - Provjeri da li se datum ispravno prikazuje
  - Provjeri da li se vrijeme postavlja na 12:00h

- [x] 6. Pripremi za deployment
  - Commit promjene
  - Informiši o potrebi za deployment

## Tehnički detalji
- Problem je vjerovatno u parseLocalDateString funkciji ili handleDateChange
- Date objekti u JavaScript-u tretiraju "YYYY-MM-DD" string kao UTC midnight
- Rješenje: koristiti lokalne Date metode ili eksplicitno postaviti sate

## Review sekcija

### Implementirane promjene:

1. **datePickerUtils.js**:
   - Dodana nova funkcija `getTodayDateString()` koja vraća današnji datum kao YYYY-MM-DD string
   - Poboljšana `parseLocalDateString()` funkcija sa boljom validacijom i logiranjem
   - Svi datumi se postavljaju na 12:00 (podne) da se izbjegnu timezone problemi

2. **LectureForm.jsx**:
   - Postavljen defaultni datum na današnji dan kada se otvara nova forma
   - Postavljen defaultni vrijeme na 12:00h
   - Importovana `getTodayDateString` funkcija

3. **UnifiedForm.jsx**:
   - Postavljen defaultni datum na današnji dan za lecture tip
   - Postavljen defaultni vrijeme na 12:00h
   - Zamijenjena handleDateChange funkcija sa pravilnom implementacijom
   - DatePicker sada koristi `parseLocalDateString` i `handleDatePickerChange`
   - Importovane sve potrebne funkcije iz datePickerUtils

### Ključne izmjene:
- Svi Date objekti se kreiraju sa vremenom na 12:00 (podne) što sprječava pomjeranje datuma zbog timezone razlika
- Defaultne vrijednosti postavljene na današnji datum i 12:00h
- Korištenje lokalnih Date metoda umjesto UTC konverzija
- Dodata detaljna logiranja za lakše praćenje problema u produkciji