# Plan za rješavanje problema sa datumima - JEDNOSTAVNO RJEŠENJE

## Problem
Kada se dodaje predavanje putem web app-a i odabere se datum (npr. 23. petak), sistem ponekad prikazuje dan ranije zbog timezone/UTC konverzije.

## Analiza problema
1. Frontend šalje datum kao string u formatu 'YYYY-MM-DD'
2. Server koristi `new Date(date)` što može dodati UTC timezone
3. To uzrokuje pomjeranje za jedan dan unazad

## JEDNOSTAVNO RJEŠENJE - Bez timezone konverzija

### Pristup: Tretirati datum kao običan string bez vremenske zone
- Frontend šalje datum kao 'YYYY-MM-DD' string
- Server parsira datum sa eksplicitnim postavljanjem vremena na 12:00 lokalno
- Ovo garantuje da datum ostaje isti bez obzira na timezone

## TODO Lista

### 1. ✅ Analiziraj problem sa datumima
- Pronađeni fajlovi: LectureForm.jsx, lecturesRoutes.js

### 2. ✅ Identifikuj uzrok problema  
- Problem je u `new Date(date)` konverziji koja može interpretirati datum kao UTC

### 3. ✅ Implementiraj jednostavnu ispravku

#### A. Frontend izmjene (`/web/src/components/LectureForm.jsx`):
- ✅ **Linija 255** - handleDateChange funkcija - ZAVRŠENO
  - Promijenjeno da formatira datum lokalno bez UTC konverzije
- ✅ **Linija 84-96** - Parsiranje datuma pri editovanju - ZAVRŠENO
  - Ažurirano da koristi lokalno formatiranje

#### B. Server izmjene:
- ✅ Kreirana nova helper funkcija `/server/utils/dateHelpers.js` - ZAVRŠENO
- ✅ `/server/routes/lecturesRoutes.js` - ZAVRŠENO
  - Dodat import helper funkcija
  - Linija 528: Ažurirano da koristi `parseLocalDate`
  - Linija 554: Weekly lectures koriste `addDays`
- ✅ `/server/index.js` - ZAVRŠENO
  - Dodat import helper funkcija
  - Ažuriran PUT endpoint (linija 2018) da koristi `parseLocalDate`

### 4. ✅ Kreirati helper funkciju za sigurno parsiranje datuma
- ✅ Lokacija: `/server/utils/dateHelpers.js` - ZAVRŠENO
- ✅ Funkcije:
  - `parseLocalDate(dateString)` - Parsira 'YYYY-MM-DD' sa vremenom 12:00
  - `formatDateToString(date)` - Formatira Date u 'YYYY-MM-DD'
  - `addDays(date, days)` - Dodaje dane na datum

### 5. ✅ Testiraj ispravku
- ✅ Kreiran test script `/temp/test-date-fix.js` - ZAVRŠENO
- ✅ Test rezultati:
  - Svi datumi se čuvaju ispravno bez pomjeranja
  - Weekly lectures funkcionišu kako treba
  - Novi pristup rješava problem sa timezone

## Implementirane izmjene

### Frontend izmjene:
1. **LectureForm.jsx - handleDateChange** (linija 251-265)
   - Koristi lokalne Date metode umjesto toISOString()
   - Formatira kao 'YYYY-MM-DD' bez timezone konverzije

2. **LectureForm.jsx - useEffect za editovanje** (linija 84-99)
   - Ažurirano parsiranje datuma za edit mode
   - Koristi isti lokalni pristup

### Server izmjene:
1. **dateHelpers.js** (nova datoteka)
   - Helper funkcije za sigurno rukovanje datumima
   - parseLocalDate postavlja vrijeme na 12:00 lokalno

2. **lecturesRoutes.js**
   - Import helper funkcija
   - POST endpoint koristi parseLocalDate
   - Weekly lectures koriste addDays

3. **index.js**
   - PUT endpoints koriste parseLocalDate
   - Podrška za DD.MM.YYYY i YYYY-MM-DD formate

## Prednosti ovog pristupa
1. **Jednostavnost** - Minimalne izmjene koda
2. **Sigurnost** - Datum se neće pomjeriti zbog timezone
3. **Konzistentnost** - Isti datum na frontendu i u bazi
4. **Održivost** - Lako za razumjeti i održavati

## Review sekcija
- ✅ Plan kreiran i implementiran
- ✅ Problem sa timezone konverzijama riješen
- ✅ Testirano i verifikovano da radi
- ✅ Server i web aplikacija rade bez problema

## STATUS: ZAVRŠENO ✅

Sve izmjene su implementirane i testirane. Problem sa datumima je riješen korištenjem lokalnog parsiranja bez timezone konverzija.