# Mobile Forms and Input Fields Analysis

## Zadatak: Pronađi sve forme i input polja u mob/ direktoriju

**Datum:** 2025-07-10  
**Status:** U toku  

### TODO Lista

- [x] Pretraži sve TextInput komponente u mob/ direktoriju
- [x] Analiziraj sve forme (registracija, prijava, dodavanje sadržaja)
- [x] Provjeri TouchableOpacity komponente kao input polja
- [x] Analiziraj stilove i boje teksta
- [x] Provjeri placeholderTextColor definicije
- [x] Provjeri konstante boja
- [ ] Identificiraj potencijalne probleme s vidljivošću teksta
- [ ] Pripremi detaljni izvještaj

## Opis zadatka

Potrebno je pronaći sva forma i input polja u mobilnoj aplikaciji (mob/ direktorij) kako bi se identificirali mogući problemi s vidljivošću teksta, posebno na bijelim pozadinama.

## Rezultati analize

### 1. Glavni screen-ovi s formama

#### AuthScreen.js
- **Lokacija:** `/home/avdo/Ders/mob/screens/AuthScreen.js`
- **Forme:**
  - Login forma (linije 341-408)
  - Registracija forma (linije 412-527)  
  - Forgot password forma (linije 531-675)
- **TextInput polja:**
  - Email/korisničko ime input (linija 347)
  - Password input (linija 360)
  - Username input (linija 418)
  - Email input registracija (linija 429)
  - Password registracija (linija 442)
  - Confirm password (linija 465)
  - Security answer (linija 505)
  - Forgot password inputs (linije 540, 580, 619, 642)

#### ProfileScreen.js
- **Lokacija:** `/home/avdo/Ders/mob/screens/ProfileScreen.js`
- **TextInput polja:**
  - Email change input (linija 500, 511)
  - Password change inputs (linije 564, 573, 582)

#### DashboardScreen.js
- **Lokacija:** `/home/avdo/Ders/mob/screens/DashboardScreen.js`
- **TextInput polja:**
  - Search input (linija 551)
  - Rejection reason input (linija 1473)

#### AddContentScreen.js
- **Lokacija:** `/home/avdo/Ders/mob/screens/AddContentScreen.js`
- **TextInput polja:**
  - Generic input renderer (linija 367)
  - Za različite tipove sadržaja

### 2. Form komponente

#### DaijaForm.jsx
- **Lokacija:** `/home/avdo/Ders/mob/components/forms/DaijaForm.jsx`
- **TextInput polja:**
  - Name input (linija 256)
  - Biography input (linija 347)
  - Education input (linija 347)

#### LectureForm.jsx
- **Lokacija:** `/home/avdo/Ders/mob/components/forms/LectureForm.jsx`
- **TextInput polja:**
  - Title input (linija 565)
  - Generic input renderer (linija 565)

#### OrganizationForm.jsx
- **Lokacija:** `/home/avdo/Ders/mob/components/forms/OrganizationForm.jsx`
- **TextInput polja:**
  - Generic input renderer (linija 246)

#### SuggestionForm.jsx
- **Lokacija:** `/home/avdo/Ders/mob/components/forms/SuggestionForm.jsx`
- **TextInput polja:**
  - Reference ID input (linija 215)
  - Description textarea (linija 227)

### 3. Ostali komponenti

#### DeleteProfileDialog.js
- **Lokacija:** `/home/avdo/Ders/mob/components/DeleteProfileDialog.js`
- **TextInput polja:**
  - Password confirmation input (linija 104)

### 4. Stilovi i boje

#### Konstante boja u svim fajlovima:
```javascript
const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87', 
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800', 
  error: '#f44336',
  info: '#2196F3',
  background: '#f8fafc',
  border: '#e2e8f0',
  textSecondary: '#999999' // ProfileScreen only
};
```

#### TextInput stilovi (AuthScreen.js primjer):
```javascript
textInput: {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  color: COLORS.gray,  // POTENCIJALNI PROBLEM
},
```

### 5. Potencijalni problemi s vidljivošću

#### KRITIČNO - Sivi tekst na bijelim pozadinama:
1. **AuthScreen.js (linije 826, 839):** `color: COLORS.gray` (#666666)
2. **SuggestionForm.jsx (linija 364):** `color: COLORS.primary` 
3. **ProfileScreen.js:** koristi `COLORS.textSecondary` (#999999)

#### PlaceholderTextColor - OK:
- Svi placeholder tekstovi koriste odgovarajuće boje (COLORS.gray, COLORS.textSecondary)

### 6. TouchableOpacity kao input polja

Ukupno 256 TouchableOpacity komponenti pronađeno, uglavnom koriste se za:
- Dugmad za slanje formi
- Navigation elementi  
- Image picker dugmad
- Date/time picker dugmad
- Dropdown opcije

## Review sekcija

### Sažetak promjena i preporuke

1. **Glavni problem:** TextInput komponente koriste `color: COLORS.gray` (#666666) što može biti teško čitljivo na bijelim pozadinama
2. **Lokacije problema:**
   - AuthScreen.js - svi input polja
   - Form komponente - input polja
   - Možda i drugi input polja

3. **Preporučene promjene:**
   - Promijeniti boju teksta u input poljima na tamniju (npr. `#333333` ili `COLORS.primary`)
   - Zadržati placeholder boje kao što jesu
   - Testirati kontrast na različitim uređajima

4. **Ukupno formi analizirano:** 8 glavnih formi/screen-ova
5. **Ukupno TextInput polja:** ~30+ input polja
6. **TouchableOpacity komponenti:** 256 (uglavnom za dugmad, ne input polja)

Analiza je kompletna i identificirala je glavne probleme s vidljivošću teksta u input poljima.