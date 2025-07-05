# Android Build Setup

## Preduslov: Java JDK

Pre nego što možete da buildate Android aplikaciju lokalno, morate imati instaliran Java JDK:

```bash
sudo apt update && sudo apt install -y openjdk-17-jdk
```

Proverite instalaciju:
```bash
java -version
javac -version
```

## Preduslov: Android SDK

Android SDK je već instaliran u `~/Android/Sdk`.

### Opcija 1: Instalirajte Android Studio
1. Preuzmite i instalirajte [Android Studio](https://developer.android.com/studio)
2. Android SDK će biti automatski instaliran

### Opcija 2: Samo Android SDK ✅ (Već završeno)
1. Instalirajte Android command line tools ✅
2. Postavite ANDROID_HOME environment varijablu ✅

### Konfiguracija SDK putanje

Editujte `android/local.properties` i postavite putanju do vašeg Android SDK:

```properties
sdk.dir=/putanja/do/vašeg/Android/Sdk
```

Tipične lokacije:
- Linux/Mac: `/home/username/Android/Sdk`
- Windows: `C:\\Users\\username\\AppData\\Local\\Android\\Sdk`

## Build komande

Nakon što postavite SDK:

- **Development APK**: `npm run build:dev`
- **Production APK**: `npm run build:prod:apk`
- **Production AAB**: `npm run build:prod`

## Troubleshooting

Ako dobijete grešku o SDK lokaciji:
1. Proverite da li postoji `android/local.properties`
2. Proverite da li je putanja u tom fajlu ispravna
3. Alternativno, postavite ANDROID_HOME environment varijablu:
   ```bash
   export ANDROID_HOME=/putanja/do/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```