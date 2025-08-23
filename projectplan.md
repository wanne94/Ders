# Plan za implementaciju 15-minutnih intervala za vrijeme predavanja

## Analiza postojećeg stanja
- ✅ Web verzija već ima implementirane 15-minutne intervale (generateTimeOptions funkcija)
- ⚠️ Mobilna verzija ima ručno definirane opcije samo od 12:00 do 23:45

## TODO Lista

### 1. [x] Provjeri da li web verzija ispravno radi sa 15-minutnim intervalima
- Testirati da li dropdown pokazuje sve opcije (00:00, 00:15, 00:30... do 23:45)
- Provjeriti da li se vrijeme ispravno čuva u bazi

### 2. [x] Ažuriraj mobilnu verziju da koristi sve 24-satne opcije sa 15-minutnim intervalima
- Zamijeni ručno definirane opcije sa generateTimeOptions funkcijom
- Osiguraj da mobilna verzija ima sve opcije od 00:00 do 23:45

### 3. [x] Testiranje funkcionalnosti
- Kreirati novo predavanje sa različitim vremenima (npr. 15:15, 15:30, 15:45)
- Provjeriti da li se prikazuju ispravno na listi predavanja
- Provjeriti da li edit forma ispravno učitava postojeće vrijeme

## Napomene
- Web verzija već ima implementiranu funkcionalnost
- Samo treba osigurati konzistentnost između web i mobilne verzije

## Review

### Sažetak promjena:
- ✅ Web verzija već je imala implementiranu `generateTimeOptions` funkciju koja generiše sve vremenske opcije od 00:00 do 23:45 sa 15-minutnim intervalima
- ✅ Mobilna verzija je ažurirana da koristi istu `generateTimeOptions` funkciju umjesto ručno definiranih opcija
- ✅ Sada obje verzije (web i mob) imaju identične vremenske opcije - 96 opcija (4 po satu × 24 sata)
- ✅ Korisnici mogu birati vrijeme sa preciznošću od 15 minuta (npr. 15:00, 15:15, 15:30, 15:45)

### Tehnički detalji:
- Promjena u fajlu: `/home/avdo/Ders/mob/components/forms/LectureForm.jsx`
- Uklonjena ručno definirana lista od 88 vremenskih opcija
- Dodana `generateTimeOptions` funkcija identična web verziji
- Funkcija koristi nested loop za generisanje svih kombinacija sati (0-23) i minuta (0, 15, 30, 45)