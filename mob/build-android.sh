#!/bin/bash

# Build Android APK/AAB lokalno putem Android Studio SDK
# Koristi Expo za generisanje Android projekta

# Postavi environment
export NODE_ENV=${1:-development}
BUILD_TYPE=${2:-apk}

# Postavi Java i Android SDK environment varijable
export JAVA_HOME=~/jdk-17.0.2
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo "🚀 Pokrećem Android build..."
echo "Environment: $NODE_ENV"
echo "Build type: $BUILD_TYPE"
echo "Java Home: $JAVA_HOME"
echo "Android Home: $ANDROID_HOME"

# Proveri da li je postavljen Android SDK
if [ ! -d "$HOME/Android/Sdk" ] && [ -z "$ANDROID_HOME" ]; then
    echo "❌ Android SDK nije pronađen!"
    echo "Molim vas instalirajte Android Studio ili postavite ANDROID_HOME environment varijablu"
    echo "Ili editujte android/local.properties fajl sa ispravnom sdk.dir putanjom"
    exit 1
fi

# Proveri da li je Java JDK dostupan
if ! command -v javac &> /dev/null; then
    echo "❌ Java JDK nije pronađen!"
    echo "Proverite da li je JAVA_HOME postavljen: $JAVA_HOME"
    exit 1
fi

# Funkcija za development build
build_dev() {
    echo "📱 Pravljenje DEVELOPMENT build-a..."
    
    # Prebuild Android folder sa development konfiguracijama
    npx expo prebuild --platform android
    
    # Idi u android folder
    cd android
    
    # Build debug APK
    ./gradlew assembleDebug
    
    echo "✅ Development APK kreiran:"
    echo "📍 android/app/build/outputs/apk/debug/app-debug.apk"
    
    cd ..
}

# Funkcija za production build
build_prod() {
    echo "📱 Pravljenje PRODUCTION build-a..."
    
    # Prebuild Android folder sa production konfiguracijama
    NODE_ENV=production npx expo prebuild --platform android
    
    # Postavi production signing config
    echo "🔐 Konfigurišem production signing..."
    sed -i 's/signingConfig signingConfigs.debug/signingConfig signingConfigs.release/' android/app/build.gradle
    
    # Idi u android folder
    cd android
    
    if [ "$BUILD_TYPE" = "aab" ]; then
        echo "📦 Pravljenje AAB (App Bundle) za Google Play..."
        ./gradlew bundleRelease
        echo "✅ Production AAB kreiran:"
        echo "📍 android/app/build/outputs/bundle/release/app-release.aab"
    else
        echo "📦 Pravljenje APK za direktnu instalaciju..."
        ./gradlew assembleRelease
        echo "✅ Production APK kreiran:"
        echo "📍 android/app/build/outputs/apk/release/app-release.apk"
    fi
    
    cd ..
}

# Glavni tok
case $NODE_ENV in
    development|dev)
        build_dev
        ;;
    production|prod)
        build_prod
        ;;
    *)
        echo "❌ Nepoznat environment: $NODE_ENV"
        echo "Koristi: ./build-android.sh [development|production] [apk|aab]"
        exit 1
        ;;
esac