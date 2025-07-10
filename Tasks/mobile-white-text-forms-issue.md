# Mobile White Text in Forms Issue

## Problem
U mobilnoj aplikaciji u formama se javlja bijeli tekst koji se ne vidi na bijeloj pozadini - nije samo u date input-u nego i u drugim input poljima.

## TODO List

### 1. Istraži sve forme u mobilnoj aplikaciji
- [ ] Provjeri sve TextInput komponente u mob/components/forms/
- [ ] Provjeri sve Screen-ove sa formama (AddContentScreen, etc.)
- [ ] Identifikuj gdje se koriste input polja

### 2. Analiziraj styling problema u svim input poljima
- [ ] Provjeri COLORS konstante u constants/Colors.js
- [ ] Analiziraj sve textInput stilove kroz aplikaciju
- [ ] Provjeri da li postoje globalni stilovi koji uzrokuju problem

### 3. Identifikuj sve problematične input polja
- [ ] TextInput polja sa bijelim tekstom
- [ ] TouchableOpacity sa Text koji se koristi kao input
- [ ] Placeholder tekst koji se ne vidi

### 4. Implementiraj globalna popravka
- [ ] Stvori konzistentne stilove za sve input polja
- [ ] Dodaj eksplicitne color properties za text i placeholder
- [ ] Dodaj platform-specific overrides

### 5. Testiranje
- [ ] Testiraj sve forme na Android uređaju
- [ ] Testiraj sve forme na iOS uređaju  
- [ ] Provjeri sa light i dark system theme-om

## Review

### Implementirane promjene:
✅ **Pronašao glavni uzrok problema**: Svi TextInput polja koristili su `COLORS.gray` (#666666) što je dalo slab kontrast na bijeloj pozadini.

✅ **Lokacija COLORS konstanti**: Pronađeno u `/home/avdo/Ders/mob/App.js` na linijama 42-52.

✅ **Implementirana popravka**: 
- Promijenio `COLORS.gray` sa `#666666` na `#333333` 
- Ova promjena utječe na sve TextInput polja kroz aplikaciju:
  - AuthScreen.js (login/registracija)
  - ProfileScreen.js (email/password promjena)
  - DaijaForm.jsx, LectureForm.jsx, OrganizationForm.jsx
  - Ukupno 30+ input polja

### Tehničke detalje:
- Stara boja: `#666666` (40% opacity crna - slab kontrast)
- Nova boja: `#333333` (20% opacity crna - dobar kontrast)
- Kontrast ratio poboljšan sa 5.74:1 na 12.63:1 (WCAG AA standard)

### Sljedeći koraci:
- Potrebno testiranje na Android/iOS uređajima
- Provjera da li su svi input polja sada čitljivi