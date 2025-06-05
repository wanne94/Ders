# Test Data Management Script

Ova skripta omogućava lako upravljanje test podacima u bazi podataka.

## Funkcionalnosti

- **Popunjavanje**: Dodaje 30 test zapisa za svaku kolekciju (predavanja, daije, udruzenja)
- **Brisanje**: Briše sve test podatke iz baze
- **Statistike**: Prikazuje trenutno stanje baze podataka
- **Demo**: Automatska demonstracija svih funkcionalnosti

## Korišćenje

### 1. Dodavanje test podataka
```bash
node manage-test-data.js populate
```

Ova komanda će kreirati:
- **30 test organizacija** sa različitim tipovima (Islamska zajednica, Medresa, Kulturno društvo, itd.)
- **30 test daija** sa realnim imenima i biografijama
- **30 test predavanja** sa povezanim daijama i organizacijama
- **1 test korisnik** (admin) za kreiranje predavanja

### 2. Brisanje test podataka
```bash
node manage-test-data.js delete
```

Ova komanda će obrisati sve test podatke, ali zadržati originalne podatke.

### 3. Pregled statistika
```bash
node manage-test-data.js stats
```

Prikazuje trenutno stanje baze podataka sa brojem zapisa po kolekcijama i statusima.

### 4. Demo (Automatska demonstracija)
```bash
node demo-test-data.js
```

Automatski pokreće sve komande u redoslijed i demonstrira funkcionalnosti.

## Generirani podaci

### Organizacije
- **Tipovi**: Islamska zajednica, Medresa, Kulturno društvo, Obrazovna institucija, Vjerska organizacija
- **Gradovi**: Sarajevo, Banja Luka, Tuzla, Zenica, Mostar, Bijeljina, Prijedor, Trebinje, Cazin, Gradačac
- **Statusи**: active (80%), pending (15%), rejected (5%)
- **Podaci**: Naziv, opis, adresa, kontakt informacije (Facebook, Instagram, Telegram, Viber)

### Daije
- **Imena**: 30 različitih islamskih imena sa inicijalima
- **Titule**: prof, mr, dr
- **Obrazovanje**: Različiti islamski univerziteti i fakulteti
- **Biografije**: Detaljne biografije sa specijalizacijama
- **Statusи**: active (80%), pending (15%), rejected (5%)
- **Datumi rođenja**: Randomni datumi između 1950-2000

### Predavanja
- **Teme**: 15 različitih islamskih tema
- **Datumi**: Buduće datumi (narednih 6 mjeseci)
- **Vremena**: 17:00 - 22:00 (večernja predavanja)
- **Statusи**: active (70%), pending (20%), rejected (10%)
- **Povezanost**: Svako predavanje je povezano sa daijom i organizacijom
- **Lokacije**: Različiti gradovi u BiH

## Sigurnost

Skripta koristi napredne regex pattern-e za prepoznavanje test podataka:
- Organizacije: Prepoznaje po nazivu i opisu
- Daije: Prepoznaje po imenima sa inicijalima i biografijama
- Predavanja: Prepoznaje po temama i opisima
- Korisnici: Briše samo test korisnika (test@example.com)

## Primjer korišćenja

```bash
# Provjeri trenutno stanje
node manage-test-data.js stats

# Dodaj test podatke
node manage-test-data.js populate

# Provjeri stanje nakon dodavanja
node manage-test-data.js stats

# Obriši test podatke
node manage-test-data.js delete

# Finalna provjera
node manage-test-data.js stats

# Ili pokreni automatsku demo
node demo-test-data.js
```

## Izlazni primjer

### Stats komanda
```
📊 CURRENT DATABASE STATISTICS:
==================================================
Organizations: 30
Daije: 30
Lectures: 30
Users: 1
Total records: 91

📈 ORGANIZATION STATUS BREAKDOWN:
------------------------------
  active: 24
  pending: 4
  rejected: 2
```

### Populate komanda
```
📊 POPULATING ORGANIZATIONS:
==================================================
✅ Created 30 test organizations

📊 POPULATING DAIJE:
==================================================
✅ Created 30 test daije

📊 POPULATING LECTURES:
==================================================
✅ Created 30 test lectures

📊 SUMMARY:
==================================================
Organizations: 30
Daije: 30
Lectures: 30
Total records: 90
```

### Delete komanda
```
🗑️ DELETING TEST DATA:
==================================================
Before deletion:
  Organizations: 30
  Daije: 30
  Lectures: 30
  Users: 1

Deletion results:
  Lectures deleted: 30
  Organizations deleted: 30
  Daije deleted: 30
  Test users deleted: 1

After deletion:
  Organizations: 0
  Daije: 0
  Lectures: 0
  Users: 0
```

## Napomene

- Skripta automatski kreira test korisnika sa email `test@example.com`
- Svi test podaci imaju prepoznatljive nazive za lako prepoznavanje
- Podaci su generirani sa realnim sadržajem prilagođenim islamskoj tematici
- Skripta koristi postojeće MongoDB konekcije i modele
- Sigurno brisanje - neće obrisati originalne podatke
- Podržava različite statusе za testiranje approval workflow-a 