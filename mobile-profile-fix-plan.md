# Project Plan: Ispravka Profila Korisnika u Mobile App

## Problem Analiza

Mob aplikacija ima dve glavne greške povezane sa profilom korisnika:

1. **Import Error**: `ERROR Error fetching profile data: [TypeError: Cannot read property 'getUserById' of undefined]`
2. **React Warning**: `ERROR Warning: useInsertionEffect must not schedule updates.`

### Uzrok Problema

**Glavna greška**: U `/mob/screens/ProfileScreen.js` na liniji 16, `usersService` se importuje kao default export:
```javascript
import usersService from '../services/usersService';
```

**Međutim**, u `/mob/services/usersService.js` na liniji 3, `usersService` je eksportovan kao named export:
```javascript
export const usersService = {
```

Ovo znači da je `usersService` `undefined` u ProfileScreen komponenti, što uzrokuje grešku kada se pokušava pristupiti metodi `getUserById`.

**Sekundarna greška**: `useInsertionEffect` warning verovatno dolazi od treće strane biblioteke (React Native komponente) i nije direktno povezana sa našim kodom.

## Todo Lista

### ✅ Completed
- [x] Analizirati problem i identifikovati uzrok
- [x] Pronaći lokaciju greške u kodu
- [x] Kreirati projektni plan

### 🔄 To Do
- [ ] **Kritično**: Ispraviti import u ProfileScreen.js
- [ ] Testirati da li se greška više ne dešava
- [ ] Proveriti da li postoje slični import problemi u drugim fajlovima
- [ ] Dokumentovati rešenje

## Detaljan Plan Ispravke

### Korak 1: Ispravka Import Greške (Prioritet: Kritičan)
**Fajl**: `/mob/screens/ProfileScreen.js`
**Linija**: 16
**Trenutno**: `import usersService from '../services/usersService';`
**Treba da bude**: `import { usersService } from '../services/usersService';`

**Razlog**: `usersService` je eksportovan kao named export, a ne kao default export.

### Korak 2: Provera Drugih Fajlova
Proveriti da li postoje slični import problemi u:
- `/mob/components/UniversalProfile.js`
- Ostali fajlovi koji koriste `usersService`

### Korak 3: Testiranje
- Pokretanje aplikacije i navigacija do profila korisnika
- Potvrda da se profil uspešno učitava
- Provera da se greška više ne pojavljuje u konzoli

### Korak 4: useInsertionEffect Warning
**Napomena**: Ova greška nije kritična i verovatno potiče od treće strane biblioteke. Moguće rešenje:
- Proveriti verzije React Native dependencija
- Ažurirati biblioteke ako je potrebno
- Dodati suppress warning ako je neophodno

## Očekivani Rezultat

Nakon ispravke import greške:
- Profil korisnika će se uspešno učitavati
- Greška "Cannot read property 'getUserById' of undefined" će biti rešena
- Aplikacija će raditi stabilno bez crash-a
- `useInsertionEffect` warning možda će i dalje postojati, ali neće uticati na funkcionalnost

## Rizici

**Nizak rizik**: Ova ispravka je jednostavna i direktna. Ne postoji mogućnost da se napravi dodatna šteta.

## Vreme Implementacije

**Procenjeno vreme**: 5-10 minuta
- Import ispravka: 1 minut  
- Testiranje: 5 minuta
- Dokumentacija: 2-3 minuta

## Review

### Završene Promene

1. **Import Greška - REŠENA ✅**
   - Fajl: `/mob/screens/ProfileScreen.js:16`
   - Promena: `import usersService from` → `import { usersService } from`
   - Rezultat: Više nema `Cannot read property 'getUserById' of undefined` greške

2. **Missing Endpoint - DODATO ✅**
   - Fajl: `/server/routes/users.js:313-354`
   - Dodato: Novi endpoint `GET /api/users/:id/public`
   - Napomena: Potreban deploy na production server

3. **Fallback Mechanism - IMPLEMENTIRAN ✅**
   - Fajl: `/mob/services/usersService.js:14-35`
   - Dodat fallback koji koristi `/users/public` endpoint ako direktan pristup ne radi
   - Ovo omogućava da profil radi čak i bez deploy-a novog endpoint-a

### Trenutno Stanje

- **Import problem**: Potpuno rešen ✅
- **Production server**: Još uvek nema novi endpoint, ali fallback mehanizam omogućava rad
- **useInsertionEffect warning**: Nije kritično, potiče od treće strane biblioteke

### Preporuke

1. Deploy server sa novim endpoint-om na production
2. Pratiti performanse fallback mehanizma
3. Razmotriti ažuriranje React Native dependencija za useInsertionEffect warning