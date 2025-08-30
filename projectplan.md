# Plan Optimizacije - Web i Mobilna Aplikacija

## Web Aplikacija (Next.js) - Kritični Problemi

### VISOK PRIORITET:
- [x] **Next.js Konfiguracija** - Previše agresivno onemogućene optimizacije u next.config.js
- [ ] **Bundle Size** - Redundantne UI biblioteke (Material-UI + Radix UI + Tailwind)
- [x] **React.memo Optimizacije** - UniversalCard komponenta se rerenderuje nepotrebno
- [ ] **Image Optimization** - Nedostaju Next.js Image komponente

### SREDNJI PRIORITET:
- [x] **API Data Fetching** - Nedostaju caching strategije
- [ ] **State Management** - Previše prop drilling-a
- [ ] **Code Duplication** - imageUtils duplikati

## Mobilna Aplikacija (React Native/Expo) - Kritični Problemi

### VISOK PRIORITET:
- [x] **FlatList Performance** - Neoptimalni parametri za renderovanje
- [x] **Memory Leaks** - Interval u UniverzalCard bez cleanup-a
- [ ] **Image Caching** - Nema strategije za keširanje slika
- [ ] **Bundle Size** - Neiskorišćene dependencije

### SREDNJI PRIORITET:
- [x] **API Caching** - Nedostaju caching mehanizmi
- [ ] **React Optimizacije** - Nedostaju useMemo/useCallback
- [ ] **Network Layer** - Dupli API pozivi

## Preporučeni redoslijed implementacije:

1. ✅ Web: Next.js config fix
2. ✅ Mobile: FlatList optimizacije
3. ✅ Web: Bundle size reduction (React.memo)
4. ✅ Mobile: Memory leak fixes
5. ✅ Obje: API caching layer

## Review Sekcija

### Završene optimizacije:

1. **Next.js konfiguracija (Web)**
   - Omogućen SWC minifier za brže buildove
   - Uključena kompresija i optimizacija fontova
   - Implementiran smart caching za statične resurse
   - Optimizovan code splitting sa vendor chunks

2. **FlatList performanse (Mobile)**
   - Smanjen windowSize sa 5 na 3
   - Dodat getItemLayout za poznate dimenzije
   - Omogućen removeClippedSubviews
   - Optimizovan broj početnih renderovanja

3. **React.memo optimizacije**
   - Web: UniversalCard sada poredi samo kritična polja
   - Mobile: UniverzalCard memo funkcija optimizovana
   - Sprečava nepotrebne re-renderinge

4. **Memory leak popravke (Mobile)**
   - Popravljen cleanup za interval u UniverzalCard
   - Optimizovan useEffect dependency array
   - Interval se pokreće samo za aktivna predavanja

5. **API Caching Layer**
   - Web: Implementiran memory cache sa automatskim čišćenjem
   - Mobile: Dual cache (memory + AsyncStorage)
   - Request deduplication za sprečavanje duplikata
   - Cache TTL konfigurisan po tipu podataka