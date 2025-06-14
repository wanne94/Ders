# Plan: Dodavanje klickable adrese i share funkcionalnosti za predavanja

## Problem
Korisnik želi da se mogu kliknuti adrese na profilima predavanja i udruzenja da se otvori aplikacija za lokaciju sa direkcijom, takođe želi da se predavanja mogu shareovati.

## Analiza trenutne situacije
1. Adrese se već prikazuju u profile komponenti (mobile i web)
2. Location ikone su već prisutne
3. Nema clickable funkcionalnost za otvaranje location app-ova
4. Nema share funkcionalnost za predavanja

## Todo stavke

### 1. Mobile App - UniversalProfile.js
- [ ] Dodati handleAddressPress funkciju za otvaranje location app-ova
- [ ] Napraviti adrese clickable u renderAllInformation funkciji
- [ ] Dodati handleShare funkciju za predavanja
- [ ] Dodati share dugme za tip 'lecture'

### 2. Web App - profile/[type]/[id].js  
- [ ] Dodati handleAddressPress funkciju za otvaranje Google Maps
- [ ] Napraviti adrese clickable u web profile komponenti
- [ ] Dodati handleShare funkciju sa Web Share API ili fallback
- [ ] Dodati share dugme za predavanja u web app-u

### 3. Testing i finalizacija
- [ ] Testirati address clicking na mobile 
- [ ] Testirati share funkcionalnost na mobile
- [ ] Testirati address clicking na web
- [ ] Testirati share funkcionalnost na web

## Detaljan pristup implementacije

### Address Clicking funkcionalnost
**Mobile (React Native):**
- Koristiti `Linking.openURL()` sa različitim URL shemama:
  - Google Maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  - Apple Maps: `http://maps.apple.com/?q=${encodeURIComponent(address)}`
- Dodati TouchableOpacity oko address teksta
- Fallback logika za različite platforme

**Web:**
- Otvaranje Google Maps u novom tabu
- URL format: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

### Share funkcionalnost za predavanja
**Mobile (React Native):**
- Koristiti `Share` API iz React Native
- Formatirati share message sa:
  - Naslov predavanja
  - Predavač/daija
  - Datum i vrijeme
  - Lokacija (adresa + grad)
  - Link do predavanja (ako postoji)

**Web:**
- Koristiti Web Share API ako je dostupan
- Fallback na clipboard copy ili mailto link
- Isto formatiranje share message-a

### Lokacije fajlova za izmjene:
1. `/mnt/c/react-apps/predavanje/mob/components/UniversalProfile.js` - Mobile implementacija
2. `/mnt/c/react-apps/predavanje/web/src/pages/profile/[type]/[id].js` - Web implementacija

## Review sekcija
*Biće dodana nakon implementacije*

## Analiza
1. Provjeriti da li server radi
2. Provjeriti network konfiguraciju u Expo aplikaciji
3. Provjeriti env varijable i API URL-ove
4. Provjeriti error logove
5. Provjeriti da li je potrebno ponovo pokrenuti Expo server

## Todo stavke

### 1. Provjera osnovnih konfiguracija
- [x] Provjeriti da li backend server radi na portu 5001 (radi na 5003)
- [x] Provjeriti network konfiguraciju u mob/config/network.js (ispravljena IP adresa)
- [x] Provjeriti env.development.js konfiguraciju (ispravljena da koristi lokalnu IP)
- [x] Provjeriti App.js za greške pri pokretanju (dodani console.log)

### 2. Debugging
- [ ] Dodati console.log u App.js da vidimo da li se aplikacija uopšte pokreće
- [ ] Provjeriti da li se AuthScreen učitava
- [ ] Provjeriti network zahtjeve prema backend-u

### 3. Rješavanje problema
- [x] Ispraviti network konfiguraciju ako je potrebno (✅ IP adresa ispravljena)
- [x] Restartovati Expo server (✅ pokrenuto sa --clear flag)
- [x] Očistiti Expo cache ako je potrebno (✅ --clear flag)

### 4. Review
- [x] Dokumentovati rješenje

## Rješenje - Konfiguracija za PowerShell i produkciju
**Problem riješen!** Konfigurisan development da koristi produkcijsku bazu i slike.

### Promjene napravljene:
1. **✅ env.development.js** - Konfigurisan da koristi:
   - `API_URL: 'https://ders.ba/api'` 
   - `SERVER_URL: 'https://ders.ba'`
   
2. **✅ Slike** - imageUtils.js automatski koristi `getServerUrl()` tako da će slike doći sa `https://ders.ba`

3. **✅ PowerShell pokretanje** - Možeš pokrenuti iz PowerShell-a:
   ```powershell
   cd C:\react-apps\predavanje\mob
   npx expo start --clear
   ```

### Rezultat:
- Mobile app koristi **produkcijsku bazu** sa svim podacima
- Slike se učitavaju sa **https://ders.ba/upload/**
- Bez potrebe za tunnel mode jer koristiš produkcijsku infrastrukturu

## ✅ RIJEŠENO!
Expo Go aplikacija radi savršeno! 

**Finalni setup:**
- Pokreće se iz PowerShell-a
- Koristi produkcijske podatke i slike
- Zaobiđeni WSL2 networking problemi

## 🖼️ Problem sa slikama daija - RIJEŠEN!
**Problem:** Slike daija se nisu prikazivale u mobile app-u, ali su radile na web-u.

**Uzrok:** Mobile app je pokušavao da učita slike sa Next.js URL-a (`https://ders.ba/uploads/...`) umjesto sa backend servera (`http://ders.ba:5003/uploads/...`).

**Rješenje:**
1. **✅ Izmjena imageUtils.js** - Dodana logika da upload slike služi sa backend servera:
   ```javascript
   const SERVER_URL = 'http://ders.ba:5003';
   // Upload slike se služe sa backend servera
   if (imagePath.includes('uploads/')) {
     return `${SERVER_URL}${cleanPath}`;
   }
   ```

2. **✅ Debug logiranje** - Dodano u UniverzalCard za praćenje URL-ova slika

3. **✅ Fallback na default slike** - onError handler automatski prebacuje na default sliku ako originalna nije dostupna

**Rezultat:** Slike daija se sada prikazuju iz backend servera ili koriste default slike ako specific slike nisu dostupne.