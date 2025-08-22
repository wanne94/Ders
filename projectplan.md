# Plan migracije na shadcn/ui biblioteku

## Analiza postojećeg stanja

### Web aplikacija (/web)
**Trenutni tech stack:**
- Next.js 14.2.30 (Pages Router)
- React 18.2.0
- Material-UI (MUI) v6.1.10 sa custom temom
- Emotion za styling (@emotion/react, @emotion/styled)
- Framer Motion za animacije
- React Beautiful DnD za drag & drop

**Komponente za migraciju (45 komponenti):**
- Navigation, UniversalCard, SearchBar, AdvancedFilters
- Form komponente: LectureForm, DaijaForm, OrganizationForm, SuggestionForm, UserForm
- UI komponente: DataTable, DraggableDataTable, LoadingSkeleton, SkeletonCard
- Dialozi: ConfirmDialog, AuthPromptDialog, DeleteProfileDialog, KeyboardShortcutsDialog
- Layout: PageLayout, ContentContainer, GridLayout, Footer
- Ostale: ThemeToggle, ShareButton, ExportButton, BulkImport, itd.

**Trenutni dizajn sistem:**
- Brand colors: Primary (#022C43), Secondary (#dc004e)
- Standardizovani font-ovi i spacing
- Custom MUI tema sa responsive typography
- Card-based layout sa shadow sistemom

### Mobilna aplikacija (/mob) 
**Trenutni tech stack:**
- React Native 0.79.5
- Expo 53.0.20
- Custom styling sa StyleSheet
- Ionicons za ikone
- React Navigation za routing

**Komponente za migraciju (23 komponenti):**
- UniverzalCard, SearchBar, AdvancedFilters, Header, BottomNavigation
- Form komponente: LectureForm, DaijaForm, OrganizationForm, SuggestionForm, CancellationReportForm
- UI komponente: LoadingSkeleton, SkeletonCard, Toast, UpdateModal
- Ostale: Menu, ShareButton, DraggableList, UndoRedoBar, itd.

**Trenutni dizajn:**
- Inline StyleSheet objekti
- Hardkodovane boje i dimenzije
- Expo Vector Icons
- Custom theme objekti

## Predlog migracije

### 1. Web aplikacija - potpuna migracija na shadcn/ui

**Faza 1: Setup i osnove** ✅ TODO
- [ ] Instalacija i konfiguracija shadcn/ui
- [ ] Konverzija na App Router (Next.js 14+)
- [ ] Setup Tailwind CSS-a
- [ ] Kreiranje color scheme-a baziranog na postojećim brand bojama
- [ ] Setup TypeScript strict mode

**Faza 2: Core UI komponenti** ✅ TODO  
- [ ] Migracija osnovnih UI primitiva (Button, Input, Card, Dialog)
- [ ] Kreiranje custom variant-a za brand identity
- [ ] Implementacija loading states (Skeleton komponenti)
- [ ] Badge i Chip komponenti

**Faza 3: Layout komponenti** ✅ TODO
- [ ] Navigation komponenta (sa shadcn NavigationMenu)
- [ ] PageLayout i ContentContainer
- [ ] Footer komponenta
- [ ] Responsive grid system

**Faza 4: Form komponenti** ✅ TODO
- [ ] LectureForm (shadcn Form + React Hook Form + Zod)
- [ ] DaijaForm 
- [ ] OrganizationForm
- [ ] SuggestionForm i UserForm
- [ ] Form validation i error handling

**Faza 5: Napredne komponente** ✅ TODO
- [ ] DataTable (shadcn Table + TanStack Table)
- [ ] DraggableDataTable (dnd-kit umesto React Beautiful DnD)
- [ ] SearchBar sa shadcn Command komponente
- [ ] AdvancedFilters

**Faza 6: UniversalCard migracija** ✅ TODO
- [ ] Refaktoring UniversalCard-a sa shadcn primitives
- [ ] Kreiranje variants za lecture/daija/organization
- [ ] Status badge sistem
- [ ] Image handling i error states

**Faza 7: Specialni slučajevi** ✅ TODO
- [ ] Charts migracija (Recharts kompatibilnost)
- [ ] Date picker komponente
- [ ] Export/Import funkcionalnosti
- [ ] Dark/Light theme support

### 2. React Native aplikacija - NativeWind pristup

**Faza 8: NativeWind setup** ✅ TODO
- [ ] Instalacija NativeWind v4
- [ ] Konfiguracija Tailwind CSS-a za React Native
- [ ] Setup design tokens koji odgovaraju web verziji
- [ ] Cross-platform color scheme

**Faza 9: Core RN komponenti** ✅ TODO
- [ ] Button, Input, Card komponente sa NativeWind
- [ ] Typography sistem
- [ ] Loading komponente (ActivityIndicator, Skeleton)
- [ ] Toast/Snackbar sistem

**Faza 10: Navigation i Layout** ✅ TODO
- [ ] Header komponenta
- [ ] BottomNavigation
- [ ] Menu komponenta
- [ ] Screen layouts

**Faza 11: Form komponenti RN** ✅ TODO
- [ ] LectureForm sa React Hook Form
- [ ] DaijaForm, OrganizationForm
- [ ] Form validation kompatibilna sa web verzijom
- [ ] Date/Time picker komponente

**Faza 12: UniverzalCard RN** ✅ TODO
- [ ] Refaktoring UniverzalCard-a sa NativeWind
- [ ] Cross-platform component variants
- [ ] Image handling i error states
- [ ] Touch interactions

**Faza 13: Specijalni RN slučajevi** ✅ TODO
- [ ] SearchBar i AdvancedFilters
- [ ] DraggableList (react-native-draggable-flatlist)
- [ ] Animacije sa Reanimated
- [ ] Platform-specific adaptacije

### 3. Cross-platform harmonizacija

**Faza 14: Shared design system** ✅ TODO
- [ ] Zajednički design tokens fajl
- [ ] Cross-platform komponente interface
- [ ] Dokumentacija design sistema
- [ ] Storybook za oba platforma

**Faza 15: Testing i optimizacija** ✅ TODO
- [ ] Unit testovi za sve migrirane komponente
- [ ] Visual regression testovi
- [ ] Performance optimizacija
- [ ] Bundle size analiza

**Faza 16: Finalizacija** ✅ TODO
- [ ] Uklanjanje starih dependencies (MUI, Emotion)
- [ ] Code cleanup i dokumentacija
- [ ] Production deployment testiranje
- [ ] Performance audit

## Preporučene biblioteke i alati

### Web (shadcn/ui ekosistem):
- **shadcn/ui** - UI komponente bazirana na Radix
- **Tailwind CSS** - Utility-first CSS framework  
- **Radix UI** - Headless UI primitives (accessibility)
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Table** - Table komponente
- **dnd-kit** - Drag and drop
- **Framer Motion** - Animacije (zadržati)
- **lucide-react** - Ikone

### React Native:
- **NativeWind v4** - Tailwind za React Native
- **React Hook Form** - Form handling (isti kao web)
- **Zod** - Schema validation (isti kao web)
- **React Native Reanimated** - Animacije
- **react-native-svg** - SVG podrška
- **Expo Vector Icons** - Zadržati za native ikone

### Shared:
- **Design tokens** - JSON konfiguracija za boje, spacing, typography
- **TypeScript** - Strict typing kroz projekat
- **Storybook** - Dokumentacija komponenti

## Color Scheme predlog

Baziran na postojećim brand bojama:

```css
/* Primary colors */
--primary: 212 84% 13%;        /* #022C43 */
--primary-foreground: 0 0% 100%;

/* Secondary colors */  
--secondary: 340 96% 43%;      /* #dc004e */
--secondary-foreground: 0 0% 100%;

/* Background colors */
--background: 0 0% 96%;        /* #f5f5f5 */
--foreground: 0 0% 12%;        /* #1f1f1f */

/* Card colors */
--card: 0 0% 100%;             /* #ffffff */
--card-foreground: 0 0% 12%;

/* Border i input */
--border: 0 0% 88%;            /* #e0e0e0 */
--input: 0 0% 88%;

/* Accent colors za highlights */
--accent: 212 84% 25%;         /* #055A87 */
--accent-foreground: 0 0% 100%;

/* Status colors */
--success: 142 76% 36%;        /* #4CAF50 */
--warning: 38 92% 50%;         /* #FF9800 */
--destructive: 4 90% 58%;      /* #F44336 */
--info: 207 90% 54%;           /* #2196F3 */
```

## Prioriteti migracije

### Visok prioritet (početi odmah):
1. **UniversalCard** - najvažnija komponenta, koristi se svugde
2. **Navigation** - osnovna navigacija
3. **Form komponente** - kritične za funkcionalnost
4. **Layout komponente** - PageLayout, ContentContainer

### Srednji prioritet:
5. **DataTable** - kompleksna ali često korišćena
6. **SearchBar i Filters** - search funkcionalnost
7. **Loading komponente** - user experience

### Nizak prioritet:
8. **Advanced features** - DraggableDataTable, Charts
9. **Export/Import** - business logic funkcionalnosti
10. **Theme switcher** - nice-to-have

## Procena vremena i složenosti

**Ukupno vreme: 8-12 nedelja (1 developer, full-time)**

### Po fazama:
- **Faze 1-3** (Setup + Core): 2 nedelje
- **Faze 4-7** (Web migracija): 3-4 nedelje  
- **Faze 8-13** (RN migracija): 3-4 nedelje
- **Faze 14-16** (Finalizacija): 1-2 nedelje

### Složenost komponenti:
- **Jednostavne** (Button, Input, Card): 1-2 dana
- **Srednje** (Forms, Navigation): 3-5 dana
- **Kompleksne** (DataTable, UniversalCard): 5-7 dana
- **Vrlo kompleksne** (Cross-platform harmony): 7-10 dana

## Rizici i mitigacija

### Glavni rizici:
1. **Breaking changes** u postojećoj funkcionalnosti
2. **Performance regression** 
3. **Accessibility issues**
4. **Cross-platform inconsistency**

### Mitigacija:
- Postupna migracija komponenta po komponenta
- Zadržavanje starih komponenti do potpune migracije
- Extensivno testiranje na svakom koraku
- Feature flags za kontrolu rollout-a

## Očekivani benefiti

### Kratkoročni:
- Moderniji kod sa boljom maintainability
- Bolja developer experience
- Konzistentan dizajn sistem

### Dugoročni:
- Lakše dodavanje novih features
- Bolje performanse
- Veća accessibility compliance
- Cross-platform design consistency
- Manji bundle size (uklanjanje MUI)

---

**Status:** ✅ TODO - Plan kreiran, čeka odobrenje za početak implementacije