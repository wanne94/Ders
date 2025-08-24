# Plan za poboljšanje OCR analize za realne plakate

## Analiza primjera plakata

### Struktura plakata:
1. **Organizator** (gore): "U.G. Ponos organizuje serijal predavanja na temu:"
2. **Naslov** (centar, najveći font): "robovi Milostivog"
3. **Podnaslov**: "NAŠI PRETHODNICI O ISKRENOSTI - 3. DIO"
4. **Predavač**: "DR. HAJRUDIN AHMETOVIĆ"
5. **Datum i vrijeme**: "PETAK 22.08.2025. Poslije akšam-namaza"
6. **Lokacija**: "Hadžikadijina bb, Gračanica"
7. **Logo organizacije**: "PONOS UDRUŽENJE GRAĐANA"

## Identificirani problemi sa trenutnim OCR-om:

### 1. **Pozadinska slika i boje**
- Plakat ima gradijent pozadinu (zelena)
- Tekst u različitim bojama (bijela, žuta/zlatna)
- Potrebna pre-obrada slike za bolji kontrast

### 2. **Različiti fontovi i veličine**
- Naslov je najveći i stilizovan
- Različite boje za različite dijelove
- Ikone pored informacija

### 3. **Specifični termini**
- "akšam-namaza" umjesto konkretnog vremena
- "bb" (bez broja) u adresi
- Religijski termini koji trebaju posebno rukovanje

## TODO lista za poboljšanja

### Phase 1: Pre-obrada slike

- [ ] **1. Implementirati pre-procesiranje slike**
  - Konverzija u crno-bijelu
  - Pojačavanje kontrasta
  - Uklanjanje pozadine
  - Detekcija i ispravljanje rotacije

- [ ] **2. Segmentacija teksta**
  - Detekcija različitih blokova teksta
  - Grupiranje povezanog teksta
  - Identifikacija hijerarhije (naslov, podnaslov, detalji)

### Phase 2: Poboljšanje parsera

- [ ] **3. Napredni parser za datum/vrijeme**
  - Prepoznavanje "poslije X namaza" → mapiranje na približno vrijeme
  - Rukovanje različitim formatima datuma
  - Podrška za relative datume ("sutra", "petkom", itd.)

- [ ] **4. Prepoznavanje organizacije i lokacije**
  - Detekcija "organizuje:", "organizator:" patterns
  - Prepoznavanje skraćenica (U.G., bb, dr., itd.)
  - Ekstrakcija grada iz adrese

- [ ] **5. Hijerarhijska analiza teksta**
  - Analiza relativnih veličina fontova
  - Prepoznavanje glavnog naslova vs podnaslova
  - Detekcija numerisanih serija ("3. DIO")

### Phase 3: UI/UX poboljšanja

- [ ] **6. Vizuelni editor ekstraktovanih podataka**
  - Prikaz originalne slike sa označenim regionima
  - Drag & drop za korekciju pogrešno prepoznatih polja
  - Sugestije za svako polje

- [ ] **7. Pamćenje patterns-a**
  - Učenje iz korekcija korisnika
  - Prepoznavanje čestih organizatora
  - Mapiranje čestih lokacija

## Implementacijski pristup

### 1. Pre-procesiranje slike (canvas/sharp)
```javascript
const preprocessImage = async (imageUrl) => {
  // 1. Učitaj sliku u canvas
  // 2. Konvertuj u grayscale
  // 3. Primijeni threshold za binarizaciju
  // 4. Pojačaj kontrast
  // 5. Vrati obrađenu sliku
};
```

### 2. Napredni parser sa kontekstom
```javascript
const contextualParser = {
  // Mapiranje namaza na vremena
  prayerTimes: {
    'sabah': '05:00',
    'podne': '12:30', 
    'ikindija': '15:30',
    'akšam': '18:00',
    'jacija': '19:30'
  },
  
  // Prepoznavanje relativnih vremena
  parseRelativeTime: (text) => {
    // "poslije akšam-namaza" → "18:30"
  },
  
  // Ekstrakcija grada iz adrese
  extractCity: (address) => {
    // Zadnja riječ je često grad
  }
};
```

### 3. Scoring algoritam za naslov
```javascript
const titleScoring = {
  // Faktori bodovanja
  factors: {
    position: 40,      // Pozicija na plakatu
    size: 30,         // Relativna veličina
    isolation: 20,    // Razmak od drugih elemenata
    keywords: 10      // Ključne riječi
  }
};
```

## Biblioteke za dodati

```json
{
  "sharp": "^0.33.0",        // Obrada slika na backend-u
  "canvas": "^2.11.0",       // Obrada slika u browser-u
  "ml5": "^0.12.0"          // ML za detekciju teksta (opciono)
}
```

## Testni scenariji

1. **Plakati sa pozadinom** - kao ovaj primjer
2. **Ručno pisani plakati** - skeniranje
3. **Fotografije pod uglom** - perspektiva korekcija
4. **Različite rezolucije** - mobilne fotografije
5. **Višejezični plakati** - arapski + bosanski

## Prioriteti

1. **HIGH**: Pre-procesiranje slike za bolji OCR
2. **HIGH**: Parser za "poslije namaza" vremena
3. **MEDIUM**: Hijerarhijska analiza teksta
4. **LOW**: ML-based poboljšanja

## Vremenska procjena

- Pre-procesiranje: 4-6 sati
- Parser poboljšanja: 3-4 sata  
- UI/UX: 2-3 sata
- Testiranje: 2 sata
- **Ukupno: 11-15 sati**