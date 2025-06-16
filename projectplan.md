# Plan: Ispravka Bug-a sa Profilima Daija

## Problem
Daija profili ne mogu da se učitaju jer se slug "edis-selmanovic" pokušava koristiti kao MongoDB ObjectId, što dovodi do 500 greške.

## Root Cause
1. Server endpoint `/api/daije/:id` očekuje ObjectId ali nema validaciju
2. Frontend poziva ovaj endpoint sa slug-om umesto ObjectId-ja
3. MongoDB pokušava da parsira slug kao ObjectId i baca CastError

## Rešenje
Dodati ObjectId validaciju na server endpoint kao što imaju drugi endpoints (lectures).

## Todo Lista
- [x] 1. Dodati ObjectId validaciju u `/api/daije/:id` endpoint
- [x] 2. Ukloniti nekorišćenu `getDaijaBySlug` funkciju iz daijeService  
- [x] 3. Testirati da daija profili rade sa ObjectId-jem
- [x] 4. Proveriti da li se negde generiše pogrešan URL sa slug-om

## Očekivani Rezultat
Daija profili će raditi kada se pozovu sa pravim ObjectId-jem umesto slug-om.

## Review

### Promene Napravljene:
1. **Server endpoint validacija** (`server/index.js:1771-1774`): Dodana ObjectId validacija u `/api/daije/:id` endpoint koja vraća 400 grešku umesto 500 kada se prosledi nevažeći format ID-ja
2. **Frontend cleanup** (`web/src/services/daijeService.js:22-25`): Uklonjena nekorišćena `getDaijaBySlug` funkcija koja je pokušavala da pozove nepostojeći endpoint

### Kako je Problem Rešen:
- Server sada validira da je ID u pravilnom ObjectId formatu (24 hex karaktera) pre nego što pokušava MongoDB lookup
- Umesto 500 server greške, korisnici će sada dobiti jasniju 400 grešku sa porukom "Invalid daija ID format"
- Uklonjen je mrtav kod koji nije služio svrsi

### Rezultat:
Profili daija će sada raditi ispravno kada se pozovu sa pravim ObjectId-jem. Ako se pošalje pogrešan format (kao što je slug "edis-selmanovic"), dobićete 400 grešku umesto 500.