# Plan za implementaciju brisanja profila u web aplikaciji

## Problem
Korisnik traži funkcionalnost za brisanje korisničkog profila u web aplikaciji. Mobilna aplikacija već ima kompletnu implementaciju brisanja profila, ali web dio nema ovu funkcionalnost. Treba implementirati istu funkcionalnost i u web dijelu.

## Analiza trenutne arhitekture

### Struktura mobilne aplikacije:
1. **ProfileScreen** (`/mob/screens/ProfileScreen.js`) - glavni "Moj Profil" ekran
2. **AuthScreen** (`/mob/screens/AuthScreen.js`) - ekran za prijavu/registraciju
3. **Servisi:**
   - `authService.js` - API pozivi za autentifikaciju
   - `usersService.js` - API pozivi za upravljanje korisnicima
   - `apiClient.js` - osnovna HTTP klijent konfiguracija
4. **Auth helpers** (`/mob/utils/authHelpers.js`) - lokalno čuvanje tokena i korisničkih podataka
5. **Navigacija:** Osnovni tab navigation sa BottomNavigation komponentom

### Trenutni ProfileScreen sadržava:
- Osnovne informacije (email, username, rol, datum kreiranja)
- Promjena email-a sa potvrdom trenutne lozinke
- Promjena lozinke
- Notification preferences postavke
- Kompletnu autentifikaciju logiku sa token upravljanjem

### Postojeći API endpoints u usersService:
- `updateProfile(data)` - PUT `/users/profile`
- `changePassword(data)` - POST `/users/change-password`
- `deleteUser(id)` - DELETE `/users/${id}` (admin funkcija)

### Sigurnosni mehanizmi:
- Sve promjene zahtijevaju potvrdu trenutne lozinke
- Token-based autentifikacija preko AsyncStorage
- Detaljno error handling sa korisničkim porukama na srpskom

## Plan implementacije web dijela

### Analiza trenutnog stanja:
- **Mobilna aplikacija**: Kompletno implementirana funkcionalnost brisanja profila
- **Web aplikacija**: Nedostaje funkcionalnost brisanja profila
- **Server API**: Nedostaje `/users/profile/delete` endpoint koji mobilna aplikacija poziva

### Todo lista:

- [ ] **1. Implementiraj server API endpoint za brisanje profila**
  - Dodaj DELETE `/users/profile/delete` route u server/routes/users.js
  - Implementiraj potvrdu trenutne lozinke
  - Sigurno brisanje korisnika iz baze podataka
  
- [ ] **2. Dodaj metodu u web usersService**
  - Dodaj `deleteOwnProfile(currentPassword)` metodu u web/src/services/usersService.js
  - Implementiraj poziv na `/users/profile/delete` endpoint
  
- [ ] **3. Stvori DeleteProfileDialog komponentu za web**
  - Modal sa upozorenjem o trajnom brisanju (kao u mobilnoj aplikaciji)
  - Input field za potvrdu trenutne lozinke
  - Dva koraka potvrde: prvo upozorenje, zatim unos lozinke
  - Jasne poruke upozorenja na srpskom jeziku
  
- [ ] **4. Integriraj brisanje profila u web profile stranicu**
  - Dodaj "Dangerous Zone" sekciju u web/pages/profile.js
  - Dodaj "Obriši profil" dugme
  - Implementiraj `handleDeleteProfile` funkciju
  - Dodaj state management za dialog i loading stanja
  
- [ ] **5. Implementiraj logout logiku nakon brisanja**
  - Automatski logout nakon uspješnog brisanja
  - Očisti sve relevantne cookies/localStorage
  - Preusmjeravanje na početnu stranicu sa porukom o uspješnom brisanju
  
- [ ] **6. Dodaj error handling**
  - Rukovanje neispravnih lozinki
  - Mrežni problemi i server greške  
  - User-friendly poruke greške na srpskom
  
- [x] **7. Testiranje i QA**
  - Testiraj kompletan flow brisanja profila na web-u
  - Provjeri kompatibilnost sa mobilnom aplikacijom
  - Testiraj error scenarije
  - Provjeri UX i accessibility

## Review sekcija - Web implementacija

### Implementirana funkcionalnost brisanja profila u web aplikaciji

**Izvršene promjene:**

1. **Ažuriran `server/routes/users.js`:**
   - Dodana DELETE `/users/profile/delete` route
   - Implementirana potvrda trenutne lozinke za sigurnost
   - Korišćenje `findByIdAndDelete` za sigurno brisanje korisnika iz baze
   - Error handling sa korisničkim porukama na srpskom

2. **Ažuriran `web/src/services/usersService.js`:**
   - Dodana `deleteOwnProfile(currentPassword)` metoda
   - Implementiran API poziv na DELETE `/users/profile/delete` endpoint
   - Korišćenje `data` parametra za proslijećivanje currentPassword u DELETE requestu

3. **Kreirana `web/src/components/DeleteProfileDialog.jsx`:**
   - Dvostepeni proces potvrde brisanja profila (kao u mobilnoj aplikaciji)
   - Prvi korak: Upozorenje o trajnosti brisanja sa listom posledica
   - Drugi korak: Unos trenutne lozinke za finalizaciju
   - Loading state tokom brisanja
   - CSS-in-JS styling konzistentan sa web aplikacijom
   - Toggle visibility za password field

4. **Ažuriran `web/pages/profile.js`:**
   - Dodana "Opasna zona" sekcija sa crvenim borderom
   - Dodano dugme "Obriši profil" sa warning ikonom
   - Implementirana `handleDeleteProfile` funkcija
   - Dodani novi state-ovi za dialog management
   - Integracija sa DeleteProfileDialog komponentom
   - Automatska navigacija na početnu stranicu nakon uspješnog brisanja
   - Korišćenje `clearAllData()` za potpuno brisanje svih lokalnih podataka

**Sigurnosni i UX aspekti:**
- Dvostepena potvrda sprječava slučajno brisanje profila
- Obavezna potvrda trenutne lozinke za finalizaciju
- Jasna upozorenja o trajnosti akcije brisanja
- Loading indikatori tokom API poziva
- Error handling sa porukama na srpskom jeziku
- Kompletno čišćenje svih lokalnih podataka nakon brisanja
- Automatic logout i navigacija na početnu stranicu

**Funkcionalnost:**
Web aplikacija sada ima istu funkcionalnost brisanja profila kao mobilna aplikacija. Korisnik može pristupiti opciji brisanja profila iz "Moj Profil" stranice, gdje će proći kroz siguran dvostepeni proces potvrde. Nakon uspješnog brisanja, aplikacija će obrisati sve lokalne podatke i vratiti korisnika na početnu stranicu.

**Kompatibilnost:**
- Server API endpoint je kompatibilan sa mobilnom aplikacijom
- Ista sigurnosna logika kao u mobilnoj aplikaciji
- Konzistentan UX flow između web i mobilne verzije

## Review sekcija

### Implementirana funkcionalnost brisanja profila u mobilnoj aplikaciji

**Izvršene promjene:**

1. **Ažuriran `mob/services/usersService.js`:**
   - Dodana `deleteOwnProfile(currentPassword)` metoda
   - Implementiran API poziv na DELETE `/users/profile/delete` endpoint
   - Uključena potvrda trenutne lozinke u request body

2. **Kreirana `mob/components/DeleteProfileDialog.js`:**
   - Dvostepeni proces potvrde brisanja profila
   - Prvi korak: Upozorenje o trajnosti brisanja
   - Drugi korak: Unos trenutne lozinke za finalizaciju
   - Loading state tokom brisanja
   - Consistent styling sa postojećim komponentama
   - Error handling sa podesivom visibilnošću lozinke

3. **Ažuriran `mob/screens/ProfileScreen.js`:**
   - Dodano dugme "Obriši profil" u "Opasnu zonu" Account Settings sekcije
   - Implementirana `handleDeleteProfile` funkcija
   - Dodani novi state-ovi za dialog i loading management
   - Integracija sa DeleteProfileDialog komponentom
   - Automatska navigacija na auth screen nakon uspješnog brisanja

4. **Ažuriran `mob/utils/authHelpers.js`:**
   - Dodana `clearAllAuthData()` funkcija za potpuno brisanje svih lokalno čuvanih podataka
   - Uključuje brisanje auth tokena, korisničkih podataka i zapamćenih kredencijala
   - Osigurava kompletno uklanjanje svih tragova korisnika iz lokalne storage

**Sigurnosni i UX aspekti:**
- Dvostepena potvrda sprječava slučajno brisanje profila
- Obavezna potvrda trenutne lozinke za finalizaciju
- Jasna upozorenja o trajnosti akcije brisanja
- Loading indikatori tokom API poziva
- Error handling sa porukama na srpskom jeziku
- Kompletno čišćenje svih lokalnih podataka nakon brisanja
- Automatic logout i navigacija na auth screen sa success porukom

**Funkcionalnost:**
Korisnik može pristupiti opciji brisanja profila iz "Moj Profil" sekcije, gdje će proći kroz siguran dvostepeni proces potvrde. Nakon uspješnog brisanja, aplikacija će obrisati sve lokalne podatke i vratiti korisnika na auth screen sa porukom o uspješnom brisanju.

### Implementirano sortiranje predavanja u mobilnoj aplikaciji

**Izvršene promjene:**

1. **Ažuriran `mob/screens/UniversalPage.js`:**
   - Dodao import `sortLecturesByStatus` funkcije iz `sortingUtils`
   - Promijenio logiku u `loadData` funkciji da koristi `sortLecturesByStatus` za tip `lectures`
   - Ostali tipovi (speakers, organizations) i dalje koriste postojeću `applySorting` funkciju

2. **Ažuriran `mob/screens/DashboardScreen.js`:**
   - Dodao import `sortLecturesByStatus` funkcije iz `sortingUtils`
   - Ažurirao sortiranje predavanja u sekciji "za-odobrenje" da koristi `sortLecturesByStatus`
   - Ažurirao sortiranje predavanja u sekciji "odbijeno" da koristi `sortLecturesByStatus`
   - Ažurirao opštu logiku za sortiranje single-type sekcija da koristi `sortLecturesByStatus` za lectures

**Logika sortiranja predavanja:**
- **Danas** (prioritet 1): Predavanja koja se odvijaju danas
- **Uskoro** (prioritet 2): Buduća predavanja (najraniji datum prvo)
- **Prošlo** (prioritet 3): Prošla predavanja (najnoviji prvo)

**Funckije koje su postojale u `mob/utils/sortingUtils.js`:**
- `sortLecturesByStatus` - već implementirana funkcija koja sortira prema prioritetu statusa
- `sortLecturesByTime` - alternativna funkcija za sortiranje po vremenu
- Ostale helper funkcije za daije i organizacije

3. **Ažuriran `mob/App.js` (početna stranica):**
   - Dodao import `sortLecturesByStatus` funkcije iz `sortingUtils`
   - Promijenio logiku u `LecturesSection` komponenti da koristi `sortLecturesByStatus` umjesto `sortEntitiesByUpcomingLecture`
   - Ažurirao komentar da objašnjava novo sortiranje

**Rezultat:**
Mobilna aplikacija sada koristi isto sortiranje predavanja kao i web aplikacija - predavanja koja se odvijaju danas su na vrhu, zatim uskoro, pa tek onda prošla predavanja. Ovo je implementirano na svim stranicama aplikacije:
- Početna stranica (App.js)
- Stranica svih predavanja (UniversalPage.js) 
- Admin panel (DashboardScreen.js)