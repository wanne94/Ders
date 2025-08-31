# Plan za rješavanje iOS/Android kompatibilnosti problema

## TODO Lista:

### Kritični problemi:
- [x] 1. Popraviti StatusBar handling u App.js - dodati platform-specifičnu logiku ✅
- [x] 2. Implementirati Safe Area handling u Header komponenti ✅

### Visoki prioritet:
- [x] 3. Optimizovati Keyboard handling u formama za iOS ✅
- [x] 4. Poboljšati Modal positioning u IOSCompatibleDropdown za Android ✅

## Detaljan plan:

### 1. StatusBar handling (App.js)
- Dodati Platform.OS provjeru
- Postaviti različite stilove za iOS i Android
- iOS: light-content sa transparentnom pozadinom
- Android: dark-content sa bojom pozadine

### 2. Safe Area handling (Header.js)
- Importovati useSafeAreaInsets iz react-native-safe-area-context
- Dodati padding-top baziran na safe area insets
- Osigurati da sadržaj ne ide ispod notch-a na iOS uređajima

### 3. Keyboard handling optimizacija
- Pronaći sve forme koje koriste KeyboardAvoidingView
- Prilagoditi keyboardVerticalOffset za iOS
- Testirati sa različitim veličinama ekrana

### 4. Modal positioning za Android
- Pregledati IOSCompatibleDropdown
- Dodati Android-specifično pozicioniranje
- Osigurati konzistentno ponašanje na obje platforme

## Review sekcija:

### Završene promjene:

1. **StatusBar handling (App.js)**
   - Dodana Platform.OS provjera
   - iOS: light-content sa transparentnom pozadinom
   - Android: dark-content sa bojom pozadine (#022C43)
   - translucent samo za iOS

2. **Safe Area handling (Header.js)**
   - Implementirana platform-specifična logika za padding-top
   - iOS: koristi safe area insets + 10px
   - Android: koristi safe area insets ili fallback na 20px

3. **Keyboard handling optimizacija**
   - Ažurirane sve forme sa KeyboardAvoidingView
   - iOS keyboardVerticalOffset postavljen na 88px za glavne forme
   - AuthScreen koristi 60px zbog drugačijeg layout-a
   - Android zadržava 0px offset

4. **Modal positioning (IOSCompatibleDropdown)**
   - Dodana elevation i shadow za Android
   - Različite animacije: iOS koristi 'slide', Android koristi 'fade'
   - statusBarTranslucent postavljen za Android
   - Poboljšano vizuelno iskustvo na obje platforme

### Rezultat:
Svi kritični i visoko prioritetni problemi kompatibilnosti između iOS i Android su riješeni. Aplikacija sada ima konzistentno ponašanje na obje platforme sa platform-specifičnim optimizacijama.