# Mobile Date Input Visibility Issue

## Problem
U mobilnoj aplikaciji kada se dodaje predavanje i odabere datum, input tekst postaje bijel pa se ne vidi na bijeloj pozadini.

## Root Cause Analysis
Na osnovu pregleda koda, pronašao sam:
- Glavni date input u `mob/components/forms/LectureForm.jsx` (linije 679-690)
- Koristi se TouchableOpacity sa Text komponentom umjesto pravog TextInput-a
- Trenutno stil koristi `COLORS.primary` (#022C43) što bi trebalo biti vidljivo
- Problem je vjerovatno u platform-specific overrides ili system theme conflicts

## Locations
- `/home/avdo/Ders/mob/components/forms/LectureForm.jsx:679-690`
- `/home/avdo/Ders/mob/screens/AddContentScreen.js`

## TODO List

### 1. Istraži trenutnu implementaciju date input-a
- [ ] Provjeri LectureForm.jsx date input implementaciju
- [ ] Provjeri AddContentScreen.js date input implementaciju  
- [ ] Identifikuj gdje se koristi TouchableOpacity umjesto TextInput-a

### 2. Analiziraj styling problema
- [ ] Provjeri COLORS konstante u constants/Colors.js
- [ ] Analiziraj dateButtonText i placeholderText stilove
- [ ] Testij na različitim device theme-ovima

### 3. Implementiraj popravku
- [ ] Dodaj eksplicitne color properties za sve date input-e
- [ ] Dodaj platform-specific overrides (Android/iOS)
- [ ] Osiguraj da text bude vidljiv u light i dark mode-u

### 4. Testiranje
- [ ] Testiraj na Android uređaju
- [ ] Testiraj na iOS uređaju
- [ ] Testiraj sa light i dark system theme-om

## Review
(Ovdje će biti sažetak promjena nakon implementacije)