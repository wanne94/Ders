# Plan za standardizaciju prikaza imena predavača sa titulama

## Problem
Imena predavača sa titulama se prikazuju različito na različitim mestima u aplikaciji. Trenutno postoje dve različite implementacije `formatDaijaTitle` funkcije koje rade različito.

## Analiza postojećeg stanja

### Web verzija (`/web/src/utils/index.js`):
```javascript
// Stavlja titulu pre imena, osim za "prof" koji ide posle
if (lowercaseTitle === 'prof') {
  return `${name}, ${lowercaseTitle}.`;
}
return `${lowercaseTitle}. ${name}`;
```

### Mobilna verzija (`/mob/utils/index.js`):
```javascript
// Stavlja "prof." posle imena, sve ostale titule pre imena
if (lowercaseTitle === 'prof' || lowercaseTitle === 'prof.') {
  return `${name} prof.`;
}
const formattedTitle = lowercaseTitle.endsWith('.') ? lowercaseTitle : `${lowercaseTitle}.`;
return `${formattedTitle} ${name}`;
```

### Backend (`/server/routes/lecturesRoutes.js`):
```javascript
// Jednostavno spaja titulu i ime bez formatiranja
speaker: `${lecture.daija.title} ${lecture.daija.name}`.trim()
```

## Mesta gde se prikazuje ime predavača:

1. **Web komponente:**
   - `/web/src/components/UniversalCard.jsx` - koristi `formatDaijaTitle`
   - `/web/src/components/EnhancedUniversalCard.jsx` - koristi `formatDaijaTitle`
   - `/web/src/components/DataTable.jsx` - koristi `formatDaijaTitle`
   - `/web/pages/profile/[type]/[[...params]].js` - koristi `formatDaijaTitle`
   - `/web/src/helpers/cardHelpers.ts` - ima svoju lokalnu implementaciju

2. **Mobilne komponente:**
   - `/mob/components/UniverzalCard.js` - koristi `formatDaijaTitle`
   - `/mob/components/UniversalProfile.js` - koristi `formatDaijaTitle`
   - `/mob/components/forms/LectureForm.jsx` - koristi `formatDaijaTitle`
   - `/mob/screens/DashboardScreen.js` - prikazuje `item.speaker` direktno

3. **Backend:**
   - `/server/routes/lecturesRoutes.js` - generiše `speaker` polje kao `${title} ${name}`

## TODO lista:

### 1. Definisanje jedinstvenog standarda formatiranja [✅]
- Odlučiti koji format koristiti (predlog: sve titule pre imena sa tačkom, npr. "dr. Ime Prezime", "prof. dr. Ime Prezime")

### 2. Kreiranje jedinstvene utility funkcije [✅]
- Kreirati novu standardizovanu `formatDaijaTitle` funkciju u `/server/utils/` folderu koja će se koristiti na backend-u

### 3. Ažuriranje backend logike [✅]
- Ažurirati `/server/routes/lecturesRoutes.js` da koristi novu utility funkciju
- Osigurati da se `speaker` polje uvek generiše na isti način

### 4. Ažuriranje web utility funkcije [✅]
- Ažurirati `/web/src/utils/index.js` sa standardizovanom logikom
- Ukloniti lokalnu implementaciju iz `/web/src/helpers/cardHelpers.ts`

### 5. Ažuriranje mobilne utility funkcije [✅]
- Ažurirati `/mob/utils/index.js` sa standardizovanom logikom

### 6. Testiranje svih komponenti [✅]
- Proveriti prikaz imena na svim mestima u web aplikaciji
- Proveriti prikaz imena na svim mestima u mobilnoj aplikaciji
- Proveriti API odgovore

### 7. Ažuriranje postojećih podataka u bazi (po potrebi) [ ]
- Ako postoje sačuvana imena sa titulama u bazi, ažurirati ih

## Predloženi standard formatiranja:
- Titula "prof." ide POSLE imena sa zapetom
- Sve ostale titule idu PRE imena
- Titule se pišu malim slovima sa tačkom na kraju
- Format za prof: `[ime], prof.`
- Format za ostale: `[titula]. [ime]`
- Primeri:
  - "dr. Marko Marković"
  - "prof. dr. Ana Anić"
  - "mr. Petar Petrović"
  - "Jasmin Durić, prof."
  - "Milica Milić, prof."

## Review:

### Implementirane izmene:

1. **Kreirana jedinstvena utility funkcija** (`/server/utils/formatHelpers.js`):
   - Standardizovana logika za formatiranje imena sa titulama
   - Titula "prof." ide posle imena sa zapetom
   - Sve ostale titule idu pre imena
   - Podrška za kombinovane titule (npr. "prof. dr.")

2. **Ažurirani fajlovi**:
   - `/server/routes/lecturesRoutes.js` - koristi novu utility funkciju
   - `/web/src/utils/index.js` - ažurirana sa istom logikom
   - `/mob/utils/index.js` - ažurirana sa istom logikom
   - `/web/src/helpers/cardHelpers.ts` - uklonjena lokalna implementacija

3. **Testiranje**:
   - Kreiran test fajl `/temp/test-daija-formatting.js`
   - Svi test slučajevi prolaze (100% success rate)
   - Verifikovano da funkcija radi konzistentno na svim platformama

### Primeri formatiranja:
- "Jasmin Durić, prof." (prof ide posle)
- "dr. Marko Marković" (dr ide pre)
- "dr. Ana Anić, prof." (kombinovane titule)
- "mr. Petar Petrović" (mr ide pre)

### Status: ZAVRŠENO ✅

Sve komponente sada koriste isti standard formatiranja imena predavača sa titulama.