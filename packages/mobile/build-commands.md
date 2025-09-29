# Android Build Komande

## Jednostavne komande za build

### Development APK
```bash
./build-android.sh dev
```
Ova komanda će:
- Kreirati debug APK
- APK će biti na: `android/app/build/outputs/apk/debug/app-debug.apk`

### Production APK  
```bash
./build-android.sh prod apk
```
Ova komanda će:
- Kreirati potpisan release APK
- APK će biti na: `android/app/build/outputs/apk/release/app-release.apk`

### Production AAB (za Google Play)
```bash
./build-android.sh prod aab
```
Ova komanda će:
- Kreirati potpisan App Bundle za upload na Google Play
- AAB će biti na: `android/app/build/outputs/bundle/release/app-release.aab`

## Naprednije opcije

### Očisti prethodni build
```bash
cd android && ./gradlew clean && cd ..
```

### Instalacija na povezan uređaj
```bash
# Za development
cd android && ./gradlew installDebug && cd ..

# Za production
cd android && ./gradlew installRelease && cd ..
```

### Prebuild samo (bez build-a)
```bash
npx expo prebuild --platform android --clear
```

## Napomene
- Za production build trebate imati podešen keystore
- Development build ne zahteva potpisivanje
- AAB format je obavezan za Google Play Store