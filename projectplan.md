# Plan poboljaanja formi u mobilnoj aplikaciji

## Analiza postojeeg stanja

### Web aplikacija ima sledee forme:
1. **UnifiedFormNew** - Univerzalna forma za predavanja, daije i udru~enja
2. **LectureFormNew** - Napredna forma za predavanja sa podrakom za viae daija, sedmine opcije, postojee slike
3. **UserForm** - Forma za korisnike sa role-based permissions
4. **OrganizationForm** - Forma za udru~enja sa socijalnim mre~ama
5. **DaijaForm** - Forma za daije sa biografijom i edukacijom
6. **SuggestionForm** - Forma za prijedloge
7. **CancellationReportForm** - Forma za prijavu otkazivanja

### Mobilna aplikacija trenutno ima:
1. **LectureForm** - Osnovna forma za predavanja
2. **DaijaForm** - Osnovna forma za daije
3. **OrganizationForm** - Osnovna forma za udru~enja
4. **SuggestionForm** - Forma za prijedloge
5. **CancellationReportForm** - Forma za prijavu otkazivanja

## Kljune funkcionalnosti koje nedostaju u mobilnoj aplikaciji:

### 1. Napredne funkcionalnosti LectureForm:
- [ ] Podraka za viae daija (daijaIds array)
- [ ] Podraka za custom speakere (customSpeakers array)
- [ ] Opcija za sedmina predavanja (isWeeklyLecture, totalWeeks)
- [ ] Izbor postojeih slika iz baze
- [ ] Short description polje
- [ ] Bolje validacije i error handling

### 2. Poboljaanja DaijaForm:
- [ ] Podraka za socijalne mre~e (facebook, viber, telegram)
- [ ] Bolje formatiranje titula
- [ ] Napredni image picker sa preview

### 3. Poboljaanja OrganizationForm:
- [ ] Nedostaju polja: phone, email, website
- [ ] Bolji UI za socijalne mre~e

### 4. UI/UX poboljaanja:
- [ ] Combobox komponenta za searchable dropdown
- [ ] Bolje date/time pickere
- [ ] Loading indikatori tokom upload-a
- [ ] Image preview sa mogunoau brisanja
- [ ] Keyboard avoiding view poboljaanja
- [ ] Animacije i tranzicije

### 5. Novi komponenti potrebni:
- [ ] UserForm za upravljanje korisnicima
- [ ] UnifiedForm za sve tipove sadr~aja

## Plan implementacije

### Faza 1: Priprema i refaktoring (1-2 dana)
- [ ] Kreirati folder `components/ui` za reusable komponente
- [ ] Kreirati Combobox komponentu za React Native
- [ ] Kreirati ImageSelector komponentu sa preview
- [ ] Kreirati DateTimePicker wrapper komponentu
- [ ] Kreirati LoadingOverlay komponentu

### Faza 2: Unapreenje LectureForm (2-3 dana)
- [ ] Dodati podrsku za viae daija
- [ ] Implementirati custom speaker opciju
- [ ] Dodati sedmine opcije
- [ ] Implementirati izbor postojeih slika
- [ ] Dodati short description polje
- [ ] Poboljaati validacije

### Faza 3: Unapreenje DaijaForm (1 dan)
- [ ] Dodati socijalne mre~e
- [ ] Poboljaati education management
- [ ] Implementirati bolji image picker

### Faza 4: Unapreenje OrganizationForm (1 dan)
- [ ] Dodati nedostajua polja
- [ ] Implementirati socijalne mre~e UI
- [ ] Poboljaati validacije

### Faza 5: Dodavanje novih formi (2 dana)
- [ ] Implementirati UserForm
- [ ] Kreirati UnifiedForm komponentu
- [ ] Integrirati sa postojeim ekranima

### Faza 6: Testing i optimizacija (1 dan)
- [ ] Testirati sve forme na iOS i Android
- [ ] Optimizovati performanse
- [ ] Dodati error recovery
- [ ] Finalizirati UX

## Tehniki detalji

### Komponente koje e biti kreirane/a~urirane:
1. `components/ui/Combobox.js` - Searchable dropdown
2. `components/ui/ImageSelector.js` - Image picker sa preview
3. `components/ui/DateTimePicker.js` - Wrapper za date/time
4. `components/ui/LoadingOverlay.js` - Loading indikator
5. `components/forms/LectureFormEnhanced.jsx` - Napredna forma
6. `components/forms/UserForm.jsx` - Nova forma za korisnike
7. `components/forms/UnifiedForm.jsx` - Univerzalna forma

### Biblioteke potrebne:
- Ve instalirane: expo-image-picker, @react-native-picker/picker, date-fns
- Mo~da potrebne: react-native-modal-datetime-picker (za bolji time picker)

## Prioriteti
1. **Visok**: Podraka za viae daija u LectureForm
2. **Visok**: Sedmine opcije za predavanja
3. **Srednji**: Izbor postojeih slika
4. **Srednji**: Socijalne mre~e u formama
5. **Nizak**: Animacije i tranzicije

## Napomene
- Zadr~ati kompatibilnost sa postojeim API-jem
- Fokus na performansama na slabijim ureajima
- Odr~ati konzistentnost sa web verzijom
- Testirati offline funkcionalnost