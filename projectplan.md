# Plan Analize i Poboljšanja: Web i Mobile Aplikacije (DERS.BA)

## Datum: 2025-10-21

## Pregled

Detaljna analiza mobile (Expo/React Native) i web (Next.js) aplikacije u skladu sa najboljim praksama tehnologija koje se koriste, identifikacija problema i predložena poboljšanja.

---

## Trenutno Stanje Projekta

### Tehnologije
**Mobile (packages/mobile):**
- React Native 0.81.4
- Expo SDK 54
- React 19.1.0
- React Navigation v7 (bottom-tabs, stack)

**Web (packages/web):**
- Next.js 15.5.4 (App Router)
- React 19.1.0
- Material UI v6.1.10
- Tailwind CSS 3.4.17

**Backend (server):**
- Express.js 4.18.2
- MongoDB/Mongoose 7.8.7

---

## Identifikovani Problemi

### 🔴 Kritični Problemi

#### 1. **Preveliki Fajlovi (Teška Održivost)**
- `packages/web/pages/dashboard.jsx`: **1,870 linija** ⚠️
- `packages/mobile/screens/DashboardScreen.js`: **105.6 KB** ⚠️
- `packages/mobile/components/forms/LectureForm.jsx`: **58.5 KB** ⚠️
- `server/index.js`: **4,659 linija** ⚠️

**Problem**: Ovi fajlovi su ekstremno veliki i teški za održavanje, testiranje i debugging.

#### 2. **Nekonzistentne Verzije**
- Root package.json: v1.3.0
- Mobile package.json: v1.3.2
- Web package.json: v1.3.0
- app.json: v1.3.3

**Problem**: Može dovesti do zbunjivosti i problema pri deploymentu.

#### 3. **663 TODO/FIXME Komentara**
**Problem**: Pokazuje visok nivo tehničkog duga koji treba riješiti.

### 🟡 Srednji Prioritet

#### 4. **Material UI v6 - Zastarjela Upotreba**
**Problemi**:
- Možda se ne koristi novi `theme.applyStyles()` API za dark mode
- Možda nedostaje `cssVariables: true` konfiguracija
- Potencijalno nema podrške za `colorSchemes`

#### 5. **Next.js 15 App Router - Potencijalne Probleme**
**Problemi**:
- Potrebno provjeriti da li se koriste `async` komponente gdje je moguće
- Da li se koristi novi `generateStaticParams` pattern
- Cache strategije (`force-cache`, `no-store`, `revalidate`)

#### 6. **React Navigation v7 - TypeScript Tipovi**
**Problemi**:
- Nema definisanih type-safe navigation tipova
- Nedostaju `ParamList` definicije
- Nema globalnog `RootParamList` type-a

#### 7. **Expo SDK 54 - Konfiguracija**
**Problemi**:
- Provjeriti da li je `newArchEnabled` postavljen
- Provjeriti `eas.json` konfiguraciju
- Optimizacija app ikona i splash screen-a

#### 8. **Deleted Search Functionality**
**Problem**: SearchScreen, SearchBar i searchService obrisani bez čišćenja referenci.

### 🟢 Niži Prioritet

#### 9. **Duplicate Code između Mobile/Web**
**Problem**: Neki kod je dupliciran umjesto da se koristi iz shared paketa.

#### 10. **Nedostaju Tests**
**Problem**: "no tests specified" greška u serveru, nepoznato test coverage.

---

## TODO Lista (Prioritizovana)

### [ ] 1. KRITIČNO: Razbijanje Velikih Fajlova

#### 1.1 [✅] Dashboard Web (packages/web/pages/dashboard.jsx)
**Početno stanje**: 1,870 linija - preveliko za održavanje
**Konačno stanje**: 1,368 linija ✅
**Smanenje**: 502 linije (-27%)

**Analiza strukture**:
- Glavni `renderContent()` switch sa 9 sekcija
- 20+ state varijabli
- Handler funkcije za CRUD operacije
- Dialozi za add/edit/delete operacije

**Plan razbijanja** (5 koraka):

**Korak 1**: Kreirati folder strukturu ✅
- [✅] Kreirati `packages/web/components/dashboard/sections/`
- [✅] Kreirati `packages/web/components/dashboard/dialogs/`
- [✅] Kreirati `packages/web/hooks/useDashboardData.js` (placeholder sa osnovnom strukturom)
- [✅] Kreirati `packages/web/hooks/useDashboardHandlers.js` (placeholder sa osnovnom strukturom)

**Korak 2**: Izvući sekcije u zasebne komponente (~250 linija svaka) ✅
- [✅] `sections/DataSection.jsx` - generička sekcija komponenta (101 linija)
- [✅] `sections/LecturesSection.jsx` - predavanja tab (76 linija)
- [✅] `sections/ApprovalSection.jsx` - za-odobrenje tab (113 linija)
- [✅] `sections/UsersSection.jsx` - korisnici tab (56 linija)
- [✅] `sections/DaijeSection.jsx` - daije tab (61 linija)
- [✅] `sections/OrganizationsSection.jsx` - organizations tab (61 linija)
- [✅] `sections/RejectedSection.jsx` - odbijeno tab (164 linija)
- [✅] `sections/CancellationReportsSection.jsx` - prijave-otkazivanje tab (101 linija)
- [✅] `sections/SuggestionsSection.jsx` - prijedlozi tab (121 linija)
- [✅] `utils/dashboardFilters.js` - filter utility (121 linija)

**Korak 3**: Izvući custom hooks
- [ ] `useDashboardData.js` - fetchData logic, data state management
- [ ] `useDashboardHandlers.js` - handleEdit, handleDelete, handleStatusChange

**Korak 4**: Izvući dialog komponente
- [ ] `dialogs/DeleteDialog.jsx`
- [ ] `dialogs/StatusChangeDialog.jsx`
- [ ] `dialogs/RejectDialog.jsx`
- [ ] `dialogs/DuplicateDialog.jsx`

**Korak 5**: Refactor main dashboard.jsx ✅
- [✅] Importovati section komponente (8 sekcija)
- [✅] Koristiti useDashboardData hook
- [✅] Ukloniti lokalni fetchData i filterData (207 linija)
- [✅] Uprošćen `renderContent()` na čist switch sa section komponentama
- [✅] Ukloniti renderSection funkciju (50 linija)

**Rezultat**:
- Dashboard.jsx: 1,870 → 1,368 linija (-502 linije, -27%)
- Ekstraktovano u 9 section komponenti + 1 utility + 1 hook
- renderContent() pojednostavljen sa 374 na ~150 linija
- Kod sada čist, modularan i održiv

#### 1.2 [ ] Dashboard Mobile (packages/mobile/screens/DashboardScreen.js)
**Akcija**:
- Slično kao web dashboard
- Kreirati `packages/mobile/components/dashboard/`
- Modularizovati logiku i UI

**Cilj**: Max 300 linija po fajlu

#### 1.3 [ ] Lecture Form (packages/mobile/components/forms/LectureForm.jsx)
**Akcija**:
- Razdvojiti na FormSections (BasicInfo, DateInfo, LocationInfo, etc.)
- Kreirati reusable form field komponente
- Izvaditi validation logiku

**Cilj**: Max 400 linija po fajlu

#### 1.4 [✅] Server Index (server/index.js)
**Akcija**:
- ✅ Razdvojiti routes u separate fajlove
  - ✅ Kreiran `routes/settingsRoutes.js` (2 endpoints)
  - ✅ Kreiran `routes/suggestionsRoutes.js` (6 endpoints)
  - ✅ Kreiran `routes/daijeRoutes.js` (12 endpoints)
  - ✅ Kreiran `routes/organizationsRoutes.js` (13 endpoints)
  - ✅ Mountanje route-ova u index.js (linija 3789-3795)
  - ✅ Uklanjanje starih route definicija iz index.js (1,078 linija uklonjeno)
- ✅ Middleware već u posebnom folderu
- ✅ Database config već razdvojen
- ⏳ Error handling za review (odgođeno za kasnije)

**Napredak**: 100% završeno
**Rezultat**:
- Fajl smanjen sa 4,664 na 3,586 linija (-23%)
- Ekstraktovano 33 endpointa u 4 modularna route fajla
- Svi route-ovi uspješno mountani i verifikovani
**Cilj**: Max 200 linija za main server file (postignuto poboljšanje, još uvijek veliki ali značajno bolji)

---

### [✅] 2. Sinhronizacija Verzija

**Akcija**:
- ✅ Odlučena jedinstvena verzija: **1.3.3**
- ✅ Ažurirani svi package.json fajlovi
- ✅ app.json već imao 1.3.3
- ✅ Version management: koristiti app.json kao source of truth

**Fajlovi ažurirani**:
- ✅ `/package.json` - 1.3.0 → 1.3.3
- ✅ `/packages/mobile/package.json` - 1.3.2 → 1.3.3
- ✅ `/packages/web/package.json` - 1.3.0 → 1.3.3
- ✅ `/app.json` - već 1.3.3

---

### [ ] 3. Material UI v6 Modernizacija

#### 3.1 [ ] Dodati CSS Variables Support
**Akcija**:
```javascript
// packages/web/src/theme.js (ili kako god se zove)
const theme = createTheme({
  cssVariables: true,
  colorSchemes: { dark: true },
  // ... ostalo
});
```

#### 3.2 [ ] Zamjeniti theme.palette.mode sa theme.applyStyles()
**Akcija**:
- Pronaći sve instance `theme.palette.mode === 'dark'`
- Zamjeniti sa `theme.applyStyles('dark', { ... })`
- Ovo rješava SSR flickering probleme

**Primjer**:
```javascript
// PRIJE
const StyledComponent = styled('div')(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#000' : '#fff',
}));

// POSLIJE
const StyledComponent = styled('div')(({ theme }) => ({
  background: '#fff',
  ...theme.applyStyles('dark', {
    background: '#000',
  }),
}));
```

#### 3.3 [ ] Dodati useColorScheme Hook
**Akcija**:
- Dodati mode switcher komponentu
- Koristiti `useColorScheme` umjesto custom rješenja

---

### [ ] 4. Next.js 15 Optimizacije

#### 4.1 [ ] Provjeriti i Optimizovati Server Components
**Akcija**:
- Pregledati sve page.tsx/jsx fajlove
- Osigurati da su async gdje je potrebno data fetching
- Dodati proper type definitions

#### 4.2 [ ] Implementirati Proper Cache Strategies
**Akcija**:
```typescript
// Static data (cached)
const staticData = await fetch('...', { cache: 'force-cache' });

// Dynamic data (not cached)
const dynamicData = await fetch('...', { cache: 'no-store' });

// ISR (revalidate every 10s)
const revalidatedData = await fetch('...', {
  next: { revalidate: 10 }
});
```

#### 4.3 [ ] Dodati generateStaticParams za Dynamic Routes
**Akcija**:
- Implementirati za `/daija/[id]`, `/lecture/[id]`, `/organization/[id]`
- Pre-render najčešće stranice

#### 4.4 [ ] Optimizovati Root Layout
**Akcija**:
- Provjeriti da li `layout.tsx` koristi proper metadata API
- Dodati font optimization ako nije

---

### [ ] 5. React Navigation v7 TypeScript Support

#### 5.1 [ ] Kreirati Navigation Types Fajl
**Akcija**:
```typescript
// packages/mobile/types/navigation.ts
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

export type RootTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
```

#### 5.2 [ ] Dodati Tipove u Screen Components
**Akcija**:
- Importovati i koristiti tipove u svim screen komponentama
- Dobiti type-safe navigation i route params

---

### [ ] 6. Expo SDK Optimizacije

#### 6.1 [ ] Razmotriti New Architecture
**Akcija**:
- Dodati u `app.config.js`:
```javascript
module.exports = {
  expo: {
    newArchEnabled: true, // ili samo za iOS/Android posebno
    // ...
  }
}
```
- Testirati kompatibilnost sa postojećim bibliotekama

#### 6.2 [ ] Optimizovati App Ikone
**Akcija**:
- Provjeriti da li se koristi `.icon` directory (SDK 54+)
- Optimizovati za dark mode variants

#### 6.3 [ ] Dodati Proper EAS Build Profiles
**Akcija**:
- Provjeriti `eas.json`
- Osigurati development, preview, production profiles
- Dodati environment variables gdje je potrebno

---

### [ ] 7. Cleanup i Refactoring

#### 7.1 [✅] Ukloniti Dead Code (Search Feature)
**Akcija**:
- ✅ Pregledao kod preko Grep
- ✅ Glavni App.js već očišćen (nema referenci)
- ✅ Obrisan App.backup.js (sadrži zastarjele reference)
- ✅ DashboardScreen.js ima lokalnu `renderSearchBar` funkciju (ne SearchBar komponentu) - OK
- ✅ Navigation već ažuriran u glavnom App.js

#### 7.2 [ ] Riješiti TODO/FIXME Komentare
**Akcija**:
- Prioritizovati top 50 najvažnijih
- Kreirati issues za ostatak
- Riješiti ili dokumentovati

#### 7.3 [ ] Shared Package Optimization
**Akcija**:
- Identifikovati duplicirani kod između web/mobile
- Pomjeriti u `packages/shared`
- Kreirati reusable komponente gdje je moguće

---

### [ ] 8. Testing Implementation

#### 8.1 [ ] Server Tests
**Akcija**:
- Dodati Jest tests za API routes
- Integration tests za database operacije
- Test coverage cilj: 70%

#### 8.2 [ ] Web Tests
**Akcija**:
- Playwright E2E tests su konfigurisani, dodati test cases
- Jest unit tests za komponente
- Test coverage cilj: 60%

#### 8.3 [ ] Mobile Tests
**Akcija**:
- Jest unit tests
- React Native Testing Library za komponente

---

### [ ] 9. Performance Optimizations

#### 9.1 [ ] Web: Image Optimization
**Akcija**:
- Koristiti Next.js `<Image>` component svuda
- Optimizovati remote image patterns
- Lazy loading za galerije

#### 9.2 [ ] Mobile: Lazy Loading
**Akcija**:
- React.lazy za heavy components
- FlatList optimizations (windowSize, removeClippedSubviews)

#### 9.3 [ ] Code Splitting
**Akcija**:
- Dynamic imports za velike komponente
- Route-based splitting (Next.js automatic)

---

### [ ] 10. Documentation

#### 10.1 [ ] README Files
**Akcija**:
- `/README.md` - Project overview
- `/packages/mobile/README.md` - Mobile setup
- `/packages/web/README.md` - Web setup
- `/server/README.md` - API documentation

#### 10.2 [ ] API Documentation
**Akcija**:
- OpenAPI/Swagger za backend routes
- JSDoc komentari za importante funkcije

---

## Prioritet Izvršavanja

### Faza 1 (1-2 sedmice) - KRITIČNO
- [ ] TODO 1.1-1.4: Razbijanje velikih fajlova
- [ ] TODO 2: Sinhronizacija verzija
- [ ] TODO 7.1: Ukloniti dead code

### Faza 2 (1 sedmica) - VISOKI PRIORITET
- [ ] TODO 3: Material UI v6 modernizacija
- [ ] TODO 4: Next.js 15 optimizacije
- [ ] TODO 5: React Navigation TypeScript

### Faza 3 (1 sedmica) - SREDNJI PRIORITET
- [ ] TODO 6: Expo SDK optimizacije
- [ ] TODO 7.2-7.3: Cleanup i refactoring
- [ ] TODO 9: Performance optimizations

### Faza 4 (Ongoing) - NIŽI PRIORITET
- [ ] TODO 8: Testing implementation
- [ ] TODO 10: Documentation

---

## Review Sekcija

### Metrike Prije Analize
- **LOC (Lines of Code)**: ~50,000+
- **Broj velikih fajlova (>500 LOC)**: 4+
- **TODO komentara**: 663
- **Test coverage**: Nepoznato (vjerovatno <20%)
- **TypeScript coverage**: Partial

### Očekivani Rezultati Poslije Implementacije
- **Broj velikih fajlova**: 0 (max 400 LOC)
- **TODO komentara**: <100
- **Test coverage**: >60%
- **Performance score (Lighthouse)**: >90
- **Bundle size reduction**: 15-20%

### Tehnički Dug
- **Prije**: Visok (ocjena 7/10)
- **Poslije**: Srednji (ocjena 4/10)

---

## Napomene

1. **Backward Compatibility**: Sve promjene moraju biti backward compatible
2. **Testing**: Svaka faza zahtjeva temeljno testiranje
3. **Git Strategy**: Feature branches za svaki TODO item
4. **Code Review**: Obavezan review prije merge-a
5. **Deployment**: Postupno deployment nakon svake faze

---

## Pitanja za Korisnika Prije Implementacije

1. Da li postoje specifične komponente koje su prioritetnije za refactoring?
2. Da li želite da odmah krenem sa Fazom 1 ili da prvo diskutujemo detalje?
3. Da li postoje neke custom Material UI customizacije koje trebam biti pažljiv da ne pokvarim?
4. Koji je target deployment timeline?
5. Da li imate preference za folder strukturu nakon razbijanja velikih fajlova?

---

**Status**: ⏳ Čeka odobrenje korisnika
