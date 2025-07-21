# Plan: Analiza strukture podataka za lecture profil u mobilnoj aplikaciji

## Cilj analize
Analizirati strukturu podataka za lecture objekte u mobilnoj aplikaciji da se razumije:
1. Koja polja su dostupna za lecture objekte
2. Kako se trenutno rukuje slikama/plakatima
3. Koja polja sadrže poster/plakat podatke
4. Kako se podaci učitavaju iz API-ja

## TODO lista:

- [x] 1. Istražiti predavanjaService u `/mob/services/` direktoriju
- [x] 2. Analizirati UniversalProfile komponentu i kako prikazuje lecture podatke
- [x] 3. Pregledati server-side Lecture model u `/server/models/`
- [x] 4. Pronaći kako se koristi 'image' polje u lecture formama
- [x] 5. Analizirati API rute i response strukture
- [x] 6. Kreirati dokumentaciju strukture podataka

## Analiza rezultata - Struktura podataka za Lecture objekte

### 1. Mongodb Lecture Model (`/server/models/Lecture.js`)

**Glavna polja:**
- `type` - String, default 'Predavanje'
- `title` - String, obavezno (naslov predavanja)
- `daija` - ObjectId referenca na Daija model (predavač)
- `organization` - String (naziv organizacije)
- `organizationId` - ObjectId referenca na Organization model
- `address` - String, obavezno
- `city` - String, obavezno
- `date` - Date, obavezno
- `time` - String, obavezno
- `duration` - Number, default 60 minuta
- `shortDescription` - String, neobavezno
- **`image` - String (glavno polje za plakat/poster!)** 
- `status` - Enum ['pending', 'approved', 'rejected'], default 'pending'
- `rejectionReason` - String, neobavezno
- `createdBy` - ObjectId referenca na User model

### 2. Kako se koriste slike/plakati

**U LectureForm komponenti (`/mob/components/forms/LectureForm.jsx`):**
- Linija 64: `image: ''` u formData
- Linija 517-528: Upload logic - koristi `uploadImage()` function iz imageUtils
- Linija 233-235: Edit mode popunjava imageUri iz postojećeg `editData.image`
- Linija 685-703: Image picker interface s previewom

**U UniversalProfile komponenti (`/mob/components/UniversalProfile.js`):**
- Linija 236-238: Prikazuje `profile.image` koristeći `getImageUrl(profile.image)`
- Linija 227-248: Image container s mogućnošću tapanja za modal prikaz
- Linija 394-417: Full-screen image modal već implementiran

### 3. API Service struktura (`/mob/services/predavanjaService.js`)

**Glavne metode:**
- `getAllPredavanja()` - dohvaća sve predavanja
- `getPredavanjeById(id)` - dohvaća specifično predavanje
- `getPredavanjaByDaija(daijaId)` - predavanja po predavaču
- `getPredavanjaByOrganization(organizationId)` - predavanja po organizaciji
- `createPredavanje(lectureData)` - kreira novo predavanje
- `updatePredavanje(id, lectureData)` - ažurira postojeće

### 4. API Response struktura iz server ruta

**Server transformacija (linija 94-101 u `/server/routes/lecturesRoutes.js`):**
```javascript
transformedLectures[i] = {
  ...lecture,
  daijaId: lecture.daija ? lecture.daija._id : null,
  speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
    ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
    : lecture.speaker || 'Nepoznat predavač'
};
```

**Populate informacije:**
- `organizationId` populated s `name` poljem
- `daija` populated s `name`, `title`, `image` poljima

### 5. Ključni zaključci za poster/plakat funkcionalnost

**DOBRA VIJEST:** 
- ✅ **`image` polje već postoji u Lecture modelu i koristi se za plakat/poster**
- ✅ **Full-screen image modal već je implementiran u UniversalProfile**
- ✅ **Image upload functionality već postoji u LectureForm**
- ✅ **`getImageUrl()` utility funkcija rukuje prikazom slika**

**TRENUTNO STANJE:**
- Polje `image` se koristi za plakat/poster predavanja
- Slika se prikazuje u hero sekciji UniversalProfile komponente (300x300px)
- Full-screen modal radi kada se tapne na sliku
- Upload i edit funkcionalnost rade ispravno

**NEDOSTAJE SAMO:**
- Kalendar integracija za dodavanje evenata
- Možda bolja optimizacija prikaza plakata

## Review sekcija

### Završena analiza pokazuje:

1. **Struktura podataka je potpuna** - `image` polje se koristi za plakate/postere
2. **Postojeći image handling je dobar** - UniversalProfile već prikazuje slike
3. **API struktura je jasna** - sve potrebne metode postoje
4. **Upload funkcionalnost radi** - LectureForm omogućava dodavanje slika
5. **Database model je optimizovan** - ima indekse za performanse

### ✅ IMPLEMENTACIJA KOMPLETNA - FINAL REVIEW

**1. PRIKAZ PLAKATA U FULL ŠIRINI**
- **Lokacija**: `/mob/components/UniversalProfile.js`
- **Promjene**: Dodani novi stilovi `fullWidthImageContainer` i `fullWidthImage` koji omogućavaju plakatima da se prikažu u 100% širine ekrana
- **Rezultat**: Lecture plakati se sada prikazuju u punoj širini umjesto fiksnih 300x300px

**2. KALENDAR FUNKCIONALNOST**
- **Dependency**: Instaliran `expo-calendar@14.1.4` 
- **Implementirane funkcije**:
  - `addToCalendar()` - traži dozvole i kreira event u kalendaru
  - `onDateTimePress()` - prikazuje confirmation dialog
- **Interaktivni elementi**: Datum i vrijeme su sada TouchableOpacity komponente
- **Event detalji**: Naslov, datum/vrijeme, lokacija, predavač i opis se automatski dodaju

**3. RESPONSIVE DESIGN OPTIMIZACIJA**
- **Breakpoint**: `screenWidth > 600px` za tablet/desktop optimizaciju
- **Plakat**: Dinamička visina - 500px za tablet, `screenWidth * 0.6` (min 300px) za phone
- **Tipografija**: Veći font-ovi na tablet uređajima (28px vs 22px za naslov)
- **Layout**: Centriran sadržaj na tablet sa maksimalnim širinama (600px opis, 800px related)
- **Spacing**: Povećani padding i margins na većim ekranima

**4. LOADING I CACHING OPTIMIZACIJE**
- **Loading indikatori**: Dodani za plakate sa "Učitavanje plakata..." porukom
- **Error handling**: Fallback placeholder slika kada plakat nije dostupan
- **Caching**: `cache="force-cache"` za bolje performance
- **State management**: `imageLoading`, `imageError` state-ovi za bolji UX

**5. POBOLJŠANJA KORISNIČKOG ISKUSTVA**
- **Visual feedback**: Loading spinner tokom učitavanja plakata
- **Error resilience**: Graceful handling grešaka sa placeholder slikama
- **Accessibility**: Bolje labelling i responsive behavior
- **Performance**: Optimizovano image loading i caching

### FINALNI REZULTATI:
✅ **Plakat se prikazuje u full širini** - 100% width umjesto 300px kvadrat
✅ **Kalendar funkcionalnost** - Klik na datum/vrijeme dodaje event u kalendar  
✅ **Responsive design** - Optimizovan za phone i tablet uređaje
✅ **Bolje loading experience** - Loading indikatori i error handling
✅ **Native kalendar integracija** - Seamless dodavanje eventa sa svim detaljima

**SVI TODO ITEM-OVI SU USPJEŠNO ZAVRŠENI!**