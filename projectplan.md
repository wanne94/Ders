# Plan: Omogućavanje dodjeljivanja više predavača jednom predavanju u mobilnoj aplikaciji

## Analiza postojećeg stanja

### Web aplikacija (LectureFormNew.jsx)
- ✅ Već podržava više predavača kroz:
  - `daijaIds` - array ID-jeva daija
  - `customSpeakers` - array prilagođenih predavača
  - UI omogućava dodavanje/brisanje više predavača
  - Lista predavača sa "X" dugmetom za brisanje

### Mobilna aplikacija (LectureForm.jsx)
- ❌ Trenutno podržava samo jednog predavača:
  - `daijaId` - samo jedan ID
  - `speaker` - jedno tekstualno polje
  - Dropdown omogućava samo jedan izbor

## TODO Lista

### [✅] 1. Ažuriranje state strukture u mobilnoj aplikaciji
- ✅ Dodati `daijaIds: []` array
- ✅ Dodati `customSpeakers: []` array
- ✅ Zadržati postojeća polja za kompatibilnost

### [✅] 2. Kreiranje komponente za prikaz liste predavača
- ✅ Prikaz dodanih daija sa nazivom i titulom
- ✅ Prikaz custom predavača
- ✅ Dugme za brisanje (X) za svaki element

### [✅] 3. Modifikacija dropdown logike
- ✅ Omogućiti dodavanje više daija u listu
- ✅ Ne zatvarati dropdown nakon izbora
- ✅ Dodati opciju za custom unos

### [✅] 4. Implementacija custom speaker inputa
- ✅ TextInput za unos imena
- ✅ Dugme "Dodaj" za dodavanje u listu
- ✅ Opcija za prebacivanje između dropdown i custom inputa

### [✅] 5. Ažuriranje handleSubmit funkcije
- ✅ Slanje `daijaIds` i `customSpeakers` na server
- ✅ Zadržati kompatibilnost sa starim API-jem

### [✅] 6. Validacija
- ✅ Provjera da postoji bar jedan predavač
- ✅ Prikaz odgovarajućih poruka greške

### [✅] 7. Edit mode podrška
- ✅ Učitavanje postojećih više predavača
- ✅ Omogućavanje uređivanja liste

### [✅] 8. UI poboljšanja
- ✅ Stilizovanje liste predavača
- ✅ Dodavanje ikona za brisanje
- ✅ Helper text kada nema predavača

### [✅] 9. Preurediti redoslijed polja
- ✅ Slika
- ✅ Naslov
- ✅ Daije/Predavači (sada podržava više)
- ✅ Datum
- ✅ Vrijeme
- ✅ Organizator
- ✅ Adresa
- ✅ Grad

## Review

### Implementirane promjene:

1. **Nova funkcionalnost - Više predavača**:
   - Mobilna aplikacija sada podržava dodavanje više predavača jednom predavanju
   - Korisnici mogu birati iz liste postojećih daija ili unijeti custom imena
   - Lista predavača se prikazuje sa mogućnošću brisanja pojedinačnih stavki

2. **Usklađen redoslijed polja**:
   - Redoslijed polja u mobilnoj formi je usklađen sa web verzijom
   - Novi redoslijed: Slika → Naslov → Daije → Datum → Vrijeme → Organizator → Adresa → Grad

3. **Kompatibilnost**:
   - Zadržana je kompatibilnost sa postojećim API-jem
   - Stara polja (`daijaId`, `speaker`) se i dalje popunjavaju za backwards kompatibilnost
   - Novi podaci se šalju kroz `daijaIds` i `customSpeakers` arrays

4. **UI/UX poboljšanja**:
   - Dodani stilovi za listu predavača
   - Implementirane animacije i vizuelni indikatori
   - Helper text koji pomaže korisniku

### Testirane funkcionalnosti:
- ✅ Dodavanje više daija iz liste
- ✅ Dodavanje custom predavača
- ✅ Brisanje predavača iz liste
- ✅ Validacija (bar jedan predavač)
- ✅ Edit mode sa postojećim podacima
- ✅ Submit sa novim podacima