# Plan za poboljšanje statusa predavanja u mob aplikaciji

## Problem
Korisnik traži poboljšanje prikaza statusa predavanja u mobilnoj aplikaciji. Trenutno se status prikazuje u gornjem desnom uglu kartice, ali treba da bude vidljiviji i jasniji.

## Zahtjevi
Za svako predavanje prikazuje se:
- naslov predavanja
- status:
  - 🟡 Uskoro — ako predavanje još nije počelo
  - 🟢 U toku — ako je trenutno aktivno
  - 🔴 Prošlo — ako je završeno

Status se automatski određuje na osnovu startTime, gdje se trajanje predavanja pretpostavlja da je 1 sat.
Računanje statusa se vrši na strani korisnika (client-side), bez API poziva.
Boja i tekst statusa se prikazuju odmah i tačno, svaki put kada se ekran otvori.

## Analiza trenutne implementacije

### Postojeća logika u UniverzalCard.js:
- Status se računa koristeći datume (danas/uskoro/proslo)
- Prikazuje se kao badge u gornjem desnom uglu
- Koristi ikone i boje, ali nema emoći
- Trenutno sortiranje: danas → uskoro → proslo

### Novo željeno ponašanje:
- Status treba da uključuje vrijeme (sat trajanja)
- Emoci umjesto ikona: 🟡 🟢 🔴
- Status "U toku" (trenutno aktivno) umjesto samo "danas"

## Plan implementacije

### Todo lista:

- [ ] **1. Ažuriranje logike računanja statusa**
  - Modificirati funkciju `getLectureStatus` u `UniverzalCard.js`
  - Dodati računanje vremena za status "U toku"
  - Pretpostavka: predavanje traje 1 sat od startTime
  
- [ ] **2. Dodavanje novih emojija**
  - Zamijeniti ikone sa emojima: 🟡 🟢 🔴
  - Ažurirati status tekstove: "Uskoro", "U toku", "Prošlo"
  - Ažurirati boje da odgovaraju emojima
  
- [ ] **3. Poboljšanje prikaza status badge-a**
  - Povećati veličinu badge-a za bolju vidljivost
  - Dodati emoji kao prefix teksta
  - Poboljšati kontrast i čitljivost
  
- [ ] **4. Ažuriranje sortiranja predavanja**
  - Modificirati `sortLecturesByStatus` u `sortingUtils.js`
  - Novi redoslijed: U toku → Uskoro → Prošlo
  - Ažurirati prioritete sortiranja
  
- [x] **5. Testiranje nove logike**
  - Testirati različite vremenske scenarije
  - Provjeri da li se status ažurira u realnom vremenu
  - Testirati granične slučajeve (početak/kraj predavanja)

## Review sekcija

### Implementirano poboljšanje statusa predavanja u mobilnoj aplikaciji

**Izvršene promjene:**

1. **Ažuriran `mob/components/UniverzalCard.js`:**
   - Modificirana funkcija `getLectureStatus` da računa status na osnovu trenutnog vremena i vremena predavanja
   - Dodato računanje vremena završetka predavanja (pretpostavka: 1 sat trajanja)
   - Novi status "utoku" za aktivna predavanja (umjesto "danas")
   - Zamijenene ikone sa emojima: 🟡 Uskoro, 🟢 U toku, 🔴 Prošlo
   - Poboljšan badge dizajn sa većim padding-om, shadow-om i font size-om
   - Dodano novo styling za emoji i statusBadgeActive

2. **Ažuriran `mob/utils/sortingUtils.js`:**
   - Modificirana funkcija `sortLecturesByStatus` da koristi novo računanje statusa
   - Ažurirani prioriteti sortiranja: U toku (1) → Uskoro (2) → Prošlo (3)
   - Dodana logika za sortiranje aktivnih predavanja po vremenu
   - Ažuriran komentar da odražava novo sortiranje

**Funkcionalnost:**
- Status se sada računa precizno na osnovu datuma i vremena predavanja
- Predavanja koja su trenutno aktivna (u toku) prikazuju se sa 🟢 "U toku"
- Buduća predavanja prikazuju se sa 🟡 "Uskoro"  
- Završena predavanja prikazuju se sa 🔴 "Prošlo"
- Sortiranje: aktivna predavanja na vrhu, zatim buduća, pa završena

**Logika statusa:**
- **U toku**: trenutno vrijeme je između vremena početka i kraja predavanja (trajanje 1 sat)
- **Uskoro**: predavanje još nije počelo
- **Prošlo**: predavanje je završeno

**UI poboljšanja:**
- Veći badge sa boljom vidljivošću
- Emoji umjesto ikona za intuitivniji prikaz
- Poboljšan shadow i kontrast za bolje čitanje

## Review sekcija - Web implementacija

### Implementirano poboljšanje statusa predavanja u web aplikaciji

**Izvršene promjene:**

1. **Ažuriran `web/src/components/UniversalCard.jsx`:**
   - Modificirana funkcija `getLectureStatus` da računa status na osnovu trenutnog vremena i vremena predavanja
   - Dodato računanje vremena završetka predavanja (pretpostavka: 1 sat trajanja)
   - Novi status "utoku" za aktivna predavanja (umjesto "danas")
   - Zamijenene status tekstove: 🟡 Uskoro, 🟢 U toku, 🔴 Prošlo
   - Poboljšan badge dizajn sa većim padding-om i font size-om

2. **Ažuriran `web/src/helpers/sortingHelpers.ts`:**
   - Modificirana funkcija `sortLecturesByStatus` da koristi novo računanje statusa
   - Ažurirani prioriteti sortiranja: U toku (1) → Uskoro (2) → Prošlo (3)
   - Dodana logika za sortiranje aktivnih predavanja po vremenu
   - Ažuriran komentar da odražava novo sortiranje
   - Dodano TypeScript tipiranje za statusPriority

3. **Ažuriran `web/src/components/RelatedLecturesSimple.jsx`:**
   - Uklonjena duplicirana inline sorting logika
   - Dodano korišćenje `sortLecturesByStatus` helper funkcije
   - Poboljšana consistency sa ostatkom aplikacije

**Funkcionalnost:**
- Status se sada računa precizno na osnovu datuma i vremena predavanja
- Predavanja koja su trenutno aktivna (u toku) prikazuju se sa 🟢 "U toku"
- Buduća predavanja prikazuju se sa 🟡 "Uskoro"  
- Završena predavanja prikazuju se sa 🔴 "Prošlo"
- Sortiranje: aktivna predavanja na vrhu, zatim buduća, pa završena

**Logika statusa:**
- **U toku**: trenutno vrijeme je između vremena početka i kraja predavanja (trajanje 1 sat)
- **Uskoro**: predavanje još nije počelo
- **Prošlo**: predavanje je završeno

**UI poboljšanja:**
- Veći badge sa boljim padding-om (6px 12px)
- Povećan font size na 0.8rem za bolju čitljivost
- Emoji umjesto ikona za intuitivniji prikaz
- Dodani custom styles za MUI Chip komponentu

**Kompatibilnost:**
Web aplikacija sada ima istu funkcionalnost kao mobilna aplikacija - predavanja se prikazuju sa tačnim statusom na osnovu trenutnog vremena i sortiraju se prema prioritetu: U toku → Uskoro → Prošlo.

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