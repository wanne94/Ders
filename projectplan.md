# Plan za izmjene kartica i dizajna

## Pregled zadatka
Potrebno je napraviti sljedeće izmjene:
1. Smanjiti broj prikazanih kartica u profilima sa 12 na 10
2. Primijeniti isti dizajn kartica (5 u redu) sa profila na početnu stranicu
3. Smanjiti razmak u naslovu predavanja kada je naslov dug i ima 2 reda

## Todo stavke

### ✅ 1. Analiza codebase-a - ZAVRŠENO
- Pronašao sam ključne fajlove i komponente
- Identificirao sam trenutnu konfiguraciju kartica

### ✅ 2. Promjena broja kartica u profilima sa 12 na 10 - ZAVRŠENO
- Fajl: `/web/pages/profile/[type]/[id].js`
- Promjena: `lecturesPerPage = 12` → `lecturesPerPage = 10`

### ✅ 3. Primjena dizajna 5 kartica u redu na početnu stranicu - ZAVRŠENO
- Fajl: `/web/pages/index.js`
- Trenutno: prikazuje 8 kartica
- Promjena: prilagoditi da koristi isti grid layout kao profili
- Povećanje broja kartica sa 8 na 10 (2 reda po 5 kartica)
- Ažuriranje teksta koji opisuje broj prikazanih kartica

### ✅ 4. Smanjenje razmaka u naslovu predavanja u kartici - ZAVRŠENO
- Fajl: `/web/src/components/UniversalCard.jsx` ili `/web/src/components/EnhancedUniversalCard.jsx`
- Promjena: smanjiti line-height ili margin za duže naslove

### ✅ 5. Testiranje promjena - ZAVRŠENO
- Provjera da li se promjene ispravno prikazuju
- Testiranje responzivnosti

### ✅ 6. Review i finalizacija - ZAVRŠENO
- Sažetak svih napravljenih promjena
- Dokumentacija izmjena

## Review - Sažetak izvršenih promjena

### Uspješno implementirane izmjene:

#### 1. **Smanjenje broja kartica u profilima** ✅
- **Fajl**: `/web/pages/profile/[type]/[id].js`
- **Promjena**: `lecturesPerPage = 12` → `lecturesPerPage = 10`
- **Efekat**: Profili sada prikazuju 10 umjesto 12 kartica po stranici

#### 2. **Ažuriranje grid sistema za konzistentnost** ✅
- **Fajl**: `/web/src/components/GridLayout.jsx`
- **Promjena**: Zamijenjen `auto-fit` grid sa eksplicitnim grid sistemom
- **Novi grid sistem**: 
  - 1 kolona na mobilnim uređajima (xs)
  - 2 kolone na malim ekranima (sm)
  - 3 kolone na srednjim ekranima (md)
  - 4 kolone na velikim ekranima (lg)
  - 5 kolona na extra velikim ekranima (xl)
- **Efekat**: Početna stranica sada koristi isti grid kao profili

#### 3. **Povećanje broja kartica na početnoj stranici** ✅
- **Fajl**: `/web/pages/index.js`
- **Promjena**: `proximityLectures = approvedLectures.slice(0, 8)` → `slice(0, 10)`
- **Tekst**: "Posljednja 8 najavljenih dersova" → "Posljednjih 10 najavljenih dersova"
- **Efekat**: Početna stranica sada prikazuje 10 umjesto 8 kartica (2 reda po 5)

#### 4. **Smanjenje razmaka u naslovima kartica** ✅
- **Fajlovi**: 
  - `/web/src/components/UniversalCard.jsx`
  - `/web/src/components/EnhancedUniversalCard.jsx`
- **Promjene**:
  - `mb: 1` → `mb: 0.5` (smanjio margin bottom)
  - Dodao `lineHeight: 1.2` (smanjio razmak između redova)
- **Efekat**: Duži naslovi u karticama sada imaju manji razmak između redova

### Tehnički detalji:
- **Sve promjene su testirane**: Lint i build prolaze bez grešaka
- **Responzivnost**: Grid sistem ostaje potpuno responzivan
- **Kompatibilnost**: Sve postojeće komponente rade normalno
- **Performance**: Nema uticaja na performanse

### Rezultat:
✅ **Krajnji cilj postignut**: Aplikacija sada ima konzistentan dizajn sa 5 kartica u redu na velikim ekranima kroz cijelu aplikaciju, smanjenim brojem kartica u profilima (10 umjesto 12) i poboljšanim formatiranjem naslova u karticama.

## Napomene
- Trenutno i profili i početna stranica koriste isti grid sistem (1-5 kolona)
- Kartice su potpuno responzivne na svim uređajima
- Smanjen razmak u naslovima poboljšava čitljivost dugih naslova