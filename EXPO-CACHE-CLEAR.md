# 🧹 Expo Cache Cleaning Instructions

## Problem
Expo development client može da kešira slike i staro ponašanje, što znači da se promene u imageUtils neće odmah reflektovati.

## Rešenja za čišćenje cache-a

### 1. **Restart Expo Development Server**
```bash
# U mob/ folderu
npm start -- --clear
# ili
npx expo start --clear
```

### 2. **Obriši Expo cache lokalno**
```bash
# Obriši expo cache
npx expo r --clear
# ili  
rm -rf node_modules/.cache
rm -rf .expo
```

### 3. **Restartuj Metro bundler**
- U Expo Dev Tools pritisni `r` za reload
- Ili pritisni `Shift + r` za full reload
- Ili pritisni `c` da očistiš cache

### 4. **Potpuno restartovanje**
```bash
# U mob/ folderu
npm start -- --reset-cache
# ili
npx expo start --reset-cache --clear
```

### 5. **Hard reset na device/simulator**
- **iOS Simulator**: Device → Erase All Content and Settings
- **Android Emulator**: Wipe data u AVD Manager
- **Physical device**: Obriši Expo Go app i ponovo instaliraj

## 🐛 Debugging slika

Sada imageUtils ima debugging logove. U konzoli ćeš videti:
```
🖼️ [DEBUG] getImageUrl called with: /uploads/images/test.jpg
🖼️ [DEBUG] Final image URL: https://ders.ba/uploads/images/test.jpg
🖼️ [DEBUG] Default lecture image URL: https://ders.ba/uploads/images/predavanjeslika.jpg
```

## ✅ Ažurirani URL-ovi

Sada imageUtils koristi ispravne putanje:
- **Default lecture**: `https://ders.ba/uploads/images/predavanjeslika.jpg`
- **Default daija**: `https://ders.ba/uploads/images/daijaslika.jpg`  
- **Default organization**: `https://ders.ba/uploads/images/udruzenjeslika.jpg`
- **Logo**: `https://ders.ba/uploads/images/logo.jpg` ✅ (ispravljen)
- **Favicon**: `https://ders.ba/uploads/images/favicon.png`

## 📱 Test u Expo

1. Pokreni `npm start -- --clear` u mob/ folderu
2. Skenuj QR kod u Expo Go
3. Proveraj konzolu za debug logove
4. Ako se i dalje prikazuju stare slike, koristi hard reset