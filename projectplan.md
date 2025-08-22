# Plan za Definitivno Rješavanje Problema sa Datumom na Produkciji

## Problem
Na produkciji (ders.ba) i dalje postoji problem - kada se odabere datum, prikazuje se prethodni dan. Problem persitira uprkos prethodnim pokušajima.

## Analiza Problema
Problem je vjerovatno u:
1. DatePicker komponenta možda šalje Date objekat sa vremenom 00:00:00 
2. Kada se taj datum konvertuje na serveru u različitoj timezone, pomjera se unazad
3. Potrebno je osigurati da se datum UVIJEK kreira sa vremenom dovoljno kasno u danu (npr. 12:00) da ne može doći do pomjeranja

## TODO Lista

- [x] 1. Detaljno analiziraj trenutni kod i logiranje
  - Dodaj ekstenzivno logiranje na sve kritične točke
  - Log na frontend kada se odabere datum
  - Log na backend kada se prima datum
  - Log kada se čuva u bazu

- [x] 2. Implementiraj robusnije rješenje za DatePicker
  - Forsiraj da DatePicker uvijek vraća datum sa vremenom 12:00
  - Dodaj eksplicitnu konverziju prije slanja na server
  - Osiguraj da se datum šalje kao string u formatu YYYY-MM-DD

- [x] 3. Popravi server stranu
  - Provjeri kako server prima i parsira datum
  - Osiguraj da parseLocalDate funkcija radi ispravno
  - Dodaj validaciju i logiranje

- [x] 4. Implementiraj timezone-agnostic pristup
  - Umjesto Date objekta, radi sa stringovima
  - Koristi format YYYY-MM-DD kroz cijeli pipeline
  - Konvertuj u Date samo kada je neophodno za prikaz

- [x] 5. Testiraj lokalno sa simulacijom produkcije
  - Postavi lokalno vrijeme na CEST timezone
  - Testiraj sa različitim datumima
  - Provjeri logove

- [x] 6. Deploy i verifikacija na produkciji
  - Deploy promjena
  - Provjeri logove na produkciji
  - Testiraj funkcionalnost

## Tehnički pristup

### Opcija 1: String-based pristup
- Nikad ne koristiti Date objekte za transport
- Uvijek raditi sa YYYY-MM-DD stringovima
- DatePicker samo za UI, odmah konvertovati u string

### Opcija 2: Eksplicitno postavljanje vremena
- Svaki put kada se kreira Date, postaviti sate na 12:00
- Na serveru također postaviti na 12:00 prije čuvanja

### Opcija 3: UTC normalizacija
- Sve datume konvertovati u UTC sa fiksnim vremenom
- Na prikazu konvertovati nazad u lokalno

## Review sekcija

### Implementirane promjene:

#### 1. Frontend (web/src/utils/datePickerUtils.js):
- **handleDatePickerChange**: Sada UVIJEK kreira datum sa vremenom 12:00 (podne)
- Kada DatePicker vrati Date objekat, ekstraktujemo komponente i kreiramo novi Date sa 12:00
- Dodano ekstenzivno logiranje sa [PRODUCTION FIX] prefiksom
- Sve datume konvertujemo u YYYY-MM-DD string format

#### 2. Frontend komponente:
- **LectureForm.jsx**: 
  - Dodano detaljno logiranje pri odabiru datuma
  - Logiranje podataka koji se šalju na server
  - Defaultni datum postavljen na današnji, vrijeme na 12:00

- **UnifiedForm.jsx**:
  - Ista logika kao LectureForm
  - Koristi handleDatePickerChange iz datePickerUtils
  - Logiranje pri slanju na server

#### 3. Backend (server/utils/dateHelpers.js):
- **parseLocalDate**: 
  - Uvijek postavlja vrijeme na 12:00 lokalno
  - Dodana validacija i ekstenzivno logiranje
  - Verifikacija da komponente datuma odgovaraju očekivanim vrijednostima

#### 4. Backend rute (server/routes/lecturesRoutes.js):
- Dodano logiranje primljenog datuma sa servera
- Logiranje parsiranog datuma nakon obrade
- Praćenje timezone informacija

### Ključne izmjene:
1. **Forsiranje vremena na 12:00**: Svaki put kada se kreira Date objekat, postavljamo sate na 12:00
2. **String-based pristup**: Radimo sa YYYY-MM-DD stringovima kroz cijeli pipeline
3. **Ekstenzivno logiranje**: Dodano na sve kritične tačke sa [PRODUCTION FIX] prefiksom
4. **Timezone-agnostic**: Koristimo lokalne Date metode umjesto UTC konverzija

### Rješenje problema:
Problem je bio što DatePicker vraća Date objekat sa vremenom 00:00:00 (ponoć). Kada se taj datum pošalje na server koji je u drugoj timezone, dolazi do pomjeranja unazad za jedan dan. Rješenje je da uvijek postavimo vrijeme na 12:00 (podne) što osigurava da će datum ostati isti bez obzira na timezone razlike.