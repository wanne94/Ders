# Plan za rješavanje problema s prikazom "nepoznat daija" u mobilnoj aplikaciji

## Problem
Kada se u mobilnoj aplikaciji ručno unese ime daije (bez izbora postojećeg daije iz baze), prilikom prikaza predavanja piše "nepoznat daija" umjesto unesenog imena.

**KRITIČNO**: Nikada se ne smije prikazati "Nepoznat daija" - uvijek mora biti prikazano stvarno ime!

## Analiza problema
1. **Frontend (mobilna aplikacija)**:
   - `LectureForm.jsx` omogućava ručni unos daije kroz opciju "Unesi ručno ime daije"
   - Kada se koristi ručni unos, postavlja se `speaker` polje ali ne `daijaId`
   - `UniverzalCard.js` prikazuje "Nepoznat daija" kada nema daije objekta

2. **Backend (server)**:
   - Model `Lecture.js` nema definirano `speaker` polje u shemi
   - API ruteovi transformišu podatke i koriste `speaker` polje, ali to polje se ne čuva u bazi
   - Kada se predavanje učita iz baze, `speaker` informacija se gubi jer nije dio modela

## TODO lista promjena

### Backend promjene:
- [x] 1. Dodaj `speaker` polje u Lecture model (`server/models/Lecture.js`)
- [x] 2. Ažuriraj POST rutu za kreiranje predavanja da čuva `speaker` polje (`server/routes/lecturesRoutes.js`)
- [x] 3. Ažuriraj PUT rutu za ažuriranje predavanja da čuva `speaker` polje
- [x] 4. Provjeri da se `speaker` polje vraća u GET rutama

### Frontend promjene (mobilna aplikacija):
- [x] 5. Ažuriraj `UniverzalCard.js` da prikazuje `speaker` polje ako nema daije objekta
- [x] 6. Uklonjen prikaz "Nepoznat daija" - sada se uvijek prikazuje stvarno ime

### Testiranje:
- [ ] 7. Testirati kreiranje novog predavanja s ručno unesenom daijom
- [ ] 8. Testirati da li se ručno unesena daija ispravno prikazuje u listi predavanja
- [ ] 9. Testirati ažuriranje postojećeg predavanja

## Detaljan opis promjena

### 1. Dodavanje `speaker` polja u model
U fajlu `server/models/Lecture.js` trebamo dodati novo polje nakon `daija` polja:
```javascript
speaker: {
  type: String,
  required: false
}
```

### 2. Logika prikaza u mobilnoj aplikaciji
U `UniverzalCard.js`, trebamo modificirati logiku prikaza:
- Prvo provjeriti da li postoji `daija` objekat (koristi formatDaijaTitle)
- Ako ne postoji, koristi `speaker` polje direktno
- Ako postoji `data.speaker` koristi to
- NIKADA ne prikazuj "Nepoznat daija" - uvijek mora biti neko ime

## Napomene
- Promjene su minimalne i neće utjecati na postojeće funkcionalnosti
- Sva postojeća predavanja koja imaju `daija` referencu će raditi kao i prije
- Nova funkcionalnost će omogućiti pravilno čuvanje i prikaz ručno unesenih imena daija

## Review implementacije

### Završene promjene:
1. **Backend model** - Dodano `speaker` polje u Lecture shemu koje omogućava čuvanje ručno unesenih imena
2. **Backend API** - POST i PUT rute sada čuvaju `speaker` polje u bazi podataka
3. **Backend transformacija** - Uklonjen default "Nepoznat predavač" - sada se vraća stvarna vrijednost
4. **Frontend prikaz** - UniverzalCard.js sada koristi `speaker` polje kad nema daija objekta
5. **Uklonjen "Nepoznat daija"** - Nikada se više neće prikazati ovaj tekst

### Kako sada funkcioniše:
- Ako predavanje ima `daija` objekat (izbor iz baze) - prikazuje se formatiran naziv daije
- Ako predavanje ima samo `speaker` string (ručni unos) - prikazuje se taj string direktno
- Nema više defaultnih vrijednosti kao "Nepoznat daija"