# Plan Nastavka Refaktorisanja - Dashboard Mobile

## Datum: 2025-10-21

## Trenutno Stanje

### ✅ Završeno (Commitovano)
1. **Dashboard Web** - potpuno refaktorisan (1,870 → 1,368 linija)
2. **LectureForm** - potpuno refaktorisan (1,813 → 1,644 linija)
3. **Server Index** - ekstraktovani route moduli (4,664 → 3,586 linija)
4. **Verzije** - sinhronizovane na 1.3.3
5. **Dead Code** - očišćen App.backup.js

### 🔄 Započeto Ali Nije Završeno
**Dashboard Mobile (packages/mobile/screens/DashboardScreen.js)**
- **Trenutno**: 3,283 linije ⚠️
- **Kreirano**:
  - ✅ Folder struktura (sections/, modals/, hooks/)
  - ✅ 3 reusable komponente (Statistics, NavigationHeader, SearchBar)
  - ✅ Placeholder hook (useMobileDashboardData.js)

### ⚠️ Uncommitted Changes
- **server/index.js**: 1,078 linija obrisano (treba provjeriti i commitovati)
- **.claude/settings.local.json**: dodato tree command u allow listu

---

## Analiza DashboardScreen.js Strukture

### Render Funkcije (10 funkcija)
1. ✅ renderNavigationHeader → već u NavigationHeader.jsx
2. ✅ renderSearchBar → već u SearchBar.jsx
3. ✅ renderStatistics → već u Statistics.jsx
4. ❌ renderDataItem → treba ekstraktovati u DataItem.jsx
5. ❌ renderBulkActionsBar → treba ekstraktovati u BulkActionsBar.jsx
6. ❌ renderContent → glavni switch (ostavlja se ali pojednostavljuje)
7-10. ❌ renderModals (7 modala) → treba ekstraktovati

### Sekcije u renderContent (9 sekcija)
1. **dashboard** - statistike (već pokriveno Statistics.jsx)
2. **predavanja** - lectures list
3. **organizations** - organizations list
4. **daije** - daije list
5. **korisnici** - users list
6. **za-odobrenje** - pending approvals
7. **odbijeno** - rejected items
8. **prijedlozi** - suggestions
9. **otkazivanja** - cancellation reports

### Modali (7 modala)
1. **ItemDetailsModal** - prikazuje detalje (lectures, daije, org, users, suggestions, reports)
2. **ApprovalModal** - approve/reject modal
3. **SettingsModal** - approval settings
4. **EditModal** - edit existing items
5. **CancelModal** - cancel lecture
6. **ReactivateModal** - reactivate cancelled lecture
7. **BulkActionsBar** - bulk selection i actions (tehnički nije modal)

---

## TODO Lista

### [ ] 1. Riješiti Uncommitted Changes

#### [❌] 1.1 Provjeriti server/index.js promjene
**Akcija**:
- Pregledati diff i vidjeti da li su endpointi pravilno premješteni u route module
- Ako su pravilno premješteni, commitovati promjene
- Ako nije, popraviti prije commita
- Testirati da endpointi rade

#### [❌] 1.2 Commitovati settings promjene
**Akcija**:
- Commitovati .claude/settings.local.json sa odgovarajućom porukom

---

### [ ] 2. Kreirati Reusable Komponente (2 komponente)

#### [❌] 2.1 Ekstraktovati DataItem.jsx
**Lokacija**: `packages/mobile/components/dashboard/DataItem.jsx`
**Opis**: Item komponenta za liste (lectures, daije, organizations, users, etc.)
**Veličina**: ~150-200 linija
**Funkcionalnost**:
- Prikazuje jedan item u listi
- Different rendering za različite tipove (lecture, daija, organization, user, suggestion, report)
- Selection checkbox (bulk mode)
- Tap handler za otvaranje details modala
- Action buttons (approve, reject, edit, cancel, etc.)

#### [❌] 2.2 Ekstraktovati BulkActionsBar.jsx
**Lokacija**: `packages/mobile/components/dashboard/BulkActionsBar.jsx`
**Opis**: Bulk selection bar sa action buttons
**Veličina**: ~100-120 linija
**Funkcionalnost**:
- Show/hide based na bulkMode
- Selection counter
- Bulk approve/reject/delete actions
- Clear selection

---

### [ ] 3. Kreirati Section Komponente (8 sekcija)

**Napomena**: Dashboard sekcija već pokrivena sa Statistics.jsx

#### [❌] 3.1 LecturesSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/LecturesSectionMobile.jsx`
**Opis**: Lista predavanja sa search i filter
**Veličina**: ~200-250 linija
**Funkcionalnost**:
- FlatList sa lectures
- Koristi DataItem komponentu
- Search query filter
- Active filters podrška
- Pull-to-refresh

#### [❌] 3.2 OrganizationsSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/OrganizationsSectionMobile.jsx`
**Opis**: Lista organizacija
**Veličina**: ~150-200 linija

#### [❌] 3.3 DaijeSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/DaijeSectionMobile.jsx`
**Opis**: Lista daija
**Veličina**: ~150-200 linija

#### [❌] 3.4 UsersSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/UsersSectionMobile.jsx`
**Opis**: Lista korisnika
**Veličina**: ~150-200 linija

#### [❌] 3.5 ApprovalSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/ApprovalSectionMobile.jsx`
**Opis**: Za-odobrenje sekcija (pending items)
**Veličina**: ~200-250 linija
**Funkcionalnost**:
- Kombinovana lista pending lectures, daije, organizations
- Group by type
- Quick approve/reject actions

#### [❌] 3.6 RejectedSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/RejectedSectionMobile.jsx`
**Opis**: Odbijeni items (super_admin only)
**Veličina**: ~150-200 linija

#### [❌] 3.7 SuggestionsSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/SuggestionsSectionMobile.jsx`
**Opis**: Prijedlozi lista
**Veličina**: ~150-200 linija

#### [❌] 3.8 CancellationsSectionMobile.jsx
**Lokacija**: `packages/mobile/components/dashboard/sections/CancellationsSectionMobile.jsx`
**Opis**: Prijave za otkazivanje predavanja
**Veličina**: ~150-200 linija

---

### [ ] 4. Kreirati Modal Komponente (7 modala)

#### [❌] 4.1 ItemDetailsModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/ItemDetailsModal.jsx`
**Opis**: Modal za prikaz detaljnih informacija bilo kog itema
**Veličina**: ~500-600 linija (veliki, kompleksan modal)
**Funkcionalnost**:
- Prikazuje details za: lectures, daije, organizations, users, suggestions, cancelled reports
- Different layout za svaki tip
- Action buttons (edit, approve, reject, cancel, etc.)
- Image gallery za lectures
- Scrollable content

#### [❌] 4.2 ApprovalModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/ApprovalModal.jsx`
**Opis**: Approve/Reject modal
**Veličina**: ~80-100 linija
**Funkcionalnost**:
- Approve button
- Reject button sa rejection reason input
- Cancel button

#### [❌] 4.3 SettingsModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/SettingsModal.jsx`
**Opis**: Approval settings modal
**Veličina**: ~100-120 linija
**Funkcionalnost**:
- Toggle switches za lecture/daija/organization approval requirements
- Save/Cancel buttons
- Persistent settings

#### [❌] 4.4 EditModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/EditModal.jsx`
**Opis**: Edit item modal (placeholder za navigaciju)
**Veličina**: ~50-70 linija
**Funkcionalnost**:
- Shows item type info
- Navigate to edit screen button
- Close button

#### [❌] 4.5 CancelModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/CancelModal.jsx`
**Opis**: Cancel lecture modal
**Veličina**: ~100-120 linija
**Funkcionalnost**:
- Cancellation reason input
- Confirm/Cancel buttons
- Warning message

#### [❌] 4.6 ReactivateModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/ReactivateModal.jsx`
**Opis**: Reactivate cancelled lecture modal
**Veličina**: ~80-100 linija
**Funkcionalnost**:
- Confirmation message
- Reactivate/Cancel buttons

#### [❌] 4.7 BulkActionsModal.jsx
**Lokacija**: `packages/mobile/components/dashboard/modals/BulkActionsModal.jsx`
**Opis**: Bulk actions confirmation modal
**Veličina**: ~100-120 linija
**Funkcionalnost**:
- Shows selected count
- Action selection (approve, reject, delete)
- Rejection reason za bulk reject
- Confirm/Cancel

---

### [ ] 5. Refaktorisati useMobileDashboardData Hook

#### [❌] 5.1 Implementirati data fetching logiku
**Lokacija**: `packages/mobile/hooks/useMobileDashboardData.js`
**Opis**: Custom hook za svu data fetching logiku
**Veličina**: ~200-250 linija
**Funkcionalnost**:
- fetchData() - dohvata sve podatke (lectures, users, daije, orgs, suggestions, reports)
- handleRefresh() - refresh svih podataka
- applyFilters() - filtriranje podataka
- search functionality
- Loading states management
- Error handling
- Return sve potrebne podatke i funkcije

---

### [ ] 6. Refaktorisati Glavni DashboardScreen.js

#### [❌] 6.1 Importovati sve kreirane komponente
**Akcija**:
- Importovati sve section komponente (8)
- Importovati sve modal komponente (7)
- Importovati reusable komponente (DataItem, BulkActionsBar)
- Importovati već kreirane (Statistics, NavigationHeader, SearchBar)
- Importovati useMobileDashboardData hook

#### [❌] 6.2 Refaktorisati renderContent()
**Akcija**:
- Pojednostaviti switch statement
- Svaki case samo renderuje odgovarajuću section komponentu
- Proslijediti potrebne props (data, handlers, states)
- Ukloniti inline render logiku

#### [❌] 6.3 Ukloniti stare render funkcije
**Akcija**:
- Obrisati renderStatistics (već u Statistics.jsx)
- Obrisati renderNavigationHeader (već u NavigationHeader.jsx)
- Obrisati renderSearchBar (već u SearchBar.jsx)
- Obrisati renderDataItem (sada u DataItem.jsx)
- Obrisati renderBulkActionsBar (sada u BulkActionsBar.jsx)
- Obrisati sve renderModal funkcije (sada u modal komponentama)

#### [❌] 6.4 Koristiti useMobileDashboardData hook
**Akcija**:
- Zamijeniti lokalni data fetching sa hookom
- Uprošćavanje state management
- Proslijediti hook rezultate komponentama

#### [❌] 6.5 Finalni cleanup
**Akcija**:
- Ukloniti neiskorištene importi
- Ukloniti neiskorištene stilove
- Ukloniti neiskorištene helper funkcije
- Code formatting

---

### [ ] 7. Testiranje i Verifikacija

#### [❌] 7.1 Testirati sve sekcije
**Akcija**:
- Testirati navigaciju između sekcija
- Testirati search functionality
- Testirati filter functionality
- Testirati refresh

#### [❌] 7.2 Testirati sve modale
**Akcija**:
- Testirati otvaranje/zatvaranje
- Testirati approve/reject akcije
- Testirati edit functionality
- Testirati bulk actions

#### [❌] 7.3 Testirati bulk mode
**Akcija**:
- Testirati selection
- Testirati bulk approve/reject/delete
- Testirati clear selection

#### [❌] 7.4 Verifikovati line count redukciju
**Akcija**:
- Provjeriti finalni broj linija DashboardScreen.js
- Cilj: 3,283 → ~400-500 linija (-85%)
- Dokumentovati rezultate

---

### [ ] 8. Commit i Dokumentacija

#### [❌] 8.1 Commit sve promjene
**Akcija**:
- Kreirati feature commit za svaku grupu komponenti
- Clear commit messages
- Git push

#### [❌] 8.2 Ažurirati projectplan.md
**Akcija**:
- Označiti sve todo stavke kao završene
- Dodati review sekciju sa rezultatima
- Dokumentovati line count redukciju
- Dokumentovati sve kreirane komponente

---

## Očekivani Rezultati

### Line Count Redukcija
- **DashboardScreen.js**: 3,283 → ~400-500 linija
- **Smanjenje**: ~2,700-2,800 linija (-82-85%)

### Kreirane Komponente
- **Reusable**: 5 komponenti (Statistics, NavigationHeader, SearchBar, DataItem, BulkActionsBar)
- **Sections**: 8 section komponenti
- **Modals**: 7 modal komponenti
- **Hooks**: 1 custom hook
- **Ukupno**: 21 novi fajl

### Distribukcija Linija Koda
- DashboardScreen.js: ~400-500 linija
- Section komponente: ~1,400-1,800 linija (8 × 150-250)
- Modal komponente: ~1,000-1,200 linija (7 × 80-600)
- Reusable komponente: ~600-700 linija (5 × 80-250)
- Hook: ~200-250 linija
- **Ukupno**: ~3,600-4,450 linija (malo više zbog bolje organizacije i dokumentacije)

### Benefiti
- ✅ Lakše održavanje - svaka komponenta izolirana
- ✅ Lakše testiranje - unit tests za svaku komponentu
- ✅ Reusabilnost - komponente se mogu koristiti drugdje
- ✅ Readability - čist, razumljiv kod
- ✅ Performance - lakše profiling i optimizacija

---

## Redoslijed Izvršavanja

**Prioritet 1** (Odmah):
1. Riješiti uncommitted changes (TODO 1)

**Prioritet 2** (Reusable komponente):
2. Kreirati DataItem i BulkActionsBar (TODO 2)

**Prioritet 3** (Sections - paralelno ako želiš):
3. Kreirati sve section komponente (TODO 3)

**Prioritet 4** (Modals):
4. Kreirati sve modal komponente (TODO 4)

**Prioritet 5** (Hook):
5. Implementirati data hook (TODO 5)

**Prioritet 6** (Integration):
6. Refaktorisati glavni fajl (TODO 6)

**Prioritet 7** (Testing):
7. Testiranje i verifikacija (TODO 7)

**Prioritet 8** (Finalizacija):
8. Commit i dokumentacija (TODO 8)

---

**Status**: ⏳ Čeka odobrenje korisnika za nastavak
