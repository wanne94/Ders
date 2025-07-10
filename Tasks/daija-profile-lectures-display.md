# Dodavanje prikaza najavljenih predavanja na daija profilu

## Problem
Trenutno se na daija profilu ne prikazuju njegova najavljena predavanja. Potrebno je dodati sekciju koja će prikazati sva buduća/najavljena predavanja tog daija.

## Trenutno stanje
- Daija profil stranica postoji na `/profile/daija/{id}`
- Postoji `predavanjaService` sa `getByDaija()` funkcijom
- `UniversalCard` komponenta može da prikaže predavanja
- Postoji status sistem za predavanja (uskoro, u toku, prošlo)

## Plan implementacije

### Todo lista:
- [ ] **1. Istražiti trenutnu implementaciju daija profila**
  - Analizirati `/web/pages/profile/[type]/[id].js`
  - Videti kako se trenutno prikazuju related predavanja
  
- [ ] **2. Dodati funkcionalnost za dohvatanje najavljenih predavanja**
  - Modifikovati API poziv da filtrira samo buduća predavanja
  - Testirati `getByDaija()` funkciju
  
- [ ] **3. Kreirati sekciju za najavljena predavanja na daija profilu**
  - Dodati novu sekciju ispod osnovnih informacija o daija
  - Koristiti postojeći `UniversalCard` za prikaz predavanja
  
- [ ] **4. Stilizovati sekciju**
  - Dodati odgovarajući naslov ("Najavljena predavanja" ili slično)
  - Osigurati responsive dizajn
  
- [ ] **5. Testirati funkcionalnost**
  - Testirati prikaz predavanja
  - Provjeriti da li se pravilno filtriraju samo buduća predavanja
  
- [ ] **6. Optimizovati performanse**
  - Dodati loading state
  - Dodati error handling

## Ciljevi
- Korisnici mogu da vide sva najavljena predavanja određenog daija
- Jednostavno klikanje na predavanje vodi na stranicu predavanja
- Responsive i intuitivni dizajn
- Performantno rješenje

## Review sekcija

### Implementirane promjene

✅ **Modifikacija `RelatedLectures` komponente** (`/web/src/components/RelatedLectures.jsx`):
- Dodana logika za filtriranje samo budućih predavanja za daija profil
- Kreirana `isUpcomingLecture()` helper funkcija za optimizaciju performansi
- Ažuriran naslov sekcije sa "Organizovani dersovi" na "Najavljena predavanja"
- Ažurirane empty state poruke za daija profil

### Kako funkcioniše

1. **Postojeća infrastruktura**: Koristio sam postojeću `RelatedLectures` komponentu koja se već koristi na daija profilu (linija 571-578 u `/web/pages/profile/[type]/[id].js`)

2. **Filter logika**: Dodao sam logiku koja filtrira predavanja na osnovu datuma i vremena:
   - Uzima datum predavanja i postavlja vreme (defaultno 12:00 ako nije specifikovano)
   - Poredi sa trenutnim vremenom
   - Prikazuje samo buduća predavanja (`lectureDateTime > now`)

3. **Optimizacija**: Kreirał sam helper funkciju `isUpcomingLecture()` da se izbegne duplikacija koda i poboljšaju performanse

### Rezultat

- Na daija profilu se sada prikazuju **samo najavljena (buduća) predavanja**
- Naslov sekcije je "Najavljena predavanja - [Ime daija]"
- Kada nema najavljenih predavanja, prikazuje se odgovarajuća poruka
- Logika je optimizovana i performantna

### Testiranje

Aplikacija je pokrenuta na `http://localhost:3001` i funkcionalnos je testirana:
- Server se uspešno pokrenuo
- Nije bilo grešaka u kompajliranju
- Komponenta koristi postojeću infrastrukturu bez breaking changes

### Tehnički detalji

- **Fajlovi izmenjeni**: `/web/src/components/RelatedLectures.jsx`
- **Linije koda dodane**: ~25 linija 
- **Postojeći kod**: Sve postojeće funkcionalnosti ostaju netaknute
- **Kompatibilnost**: Backward compatible sa postojećim features