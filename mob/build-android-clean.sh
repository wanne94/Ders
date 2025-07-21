#!/bin/bash

# Clean Android Build Script (without Expo)
# Usage: ./build-android-clean.sh [dev|prod] [apk|aab]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BUILD_ENV=${1:-prod}
BUILD_TYPE=${2:-aab}

# Environment setup
export JAVA_HOME=~/jdk-17.0.2
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

echo -e "${BLUE}🚀 Pokrećem čisti Android build (bez Expo)...${NC}"
echo "Environment: $BUILD_ENV"
echo "Build type: $BUILD_TYPE"
echo "Java Home: $JAVA_HOME"
echo "Android Home: $ANDROID_HOME"

# Clean previous builds
echo -e "${YELLOW}🧹 Čištenje prethodnih buildova...${NC}"
cd android
./gradlew clean
cd ..

# Install dependencies
echo -e "${YELLOW}📦 Instaliranje dependencija...${NC}"
npm install

# Bundle JS for production
if [ "$BUILD_ENV" = "prod" ]; then
    echo -e "${YELLOW}📱 Kreiranje production JS bundle...${NC}"
    npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file index.js \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res
fi

# Build Android app
echo -e "${YELLOW}🔨 Building Android aplikaciju...${NC}"
cd android

if [ "$BUILD_ENV" = "prod" ]; then
    if [ "$BUILD_TYPE" = "apk" ]; then
        echo -e "${YELLOW}📦 Kreiranje production APK...${NC}"
        ./gradlew assembleRelease
        echo -e "${GREEN}✅ Production APK kreiran:${NC}"
        echo -e "${BLUE}📍 android/app/build/outputs/apk/release/app-release.apk${NC}"
    else
        echo -e "${YELLOW}📦 Kreiranje production AAB...${NC}"
        ./gradlew bundleRelease
        echo -e "${GREEN}✅ Production AAB kreiran:${NC}"
        echo -e "${BLUE}📍 android/app/build/outputs/bundle/release/app-release.aab${NC}"
    fi
else
    echo -e "${YELLOW}📦 Kreiranje debug build...${NC}"
    ./gradlew assembleDebug
    echo -e "${GREEN}✅ Debug APK kreiran:${NC}"
    echo -e "${BLUE}📍 android/app/build/outputs/apk/debug/app-debug.apk${NC}"
fi

cd ..

echo -e "${GREEN}🎉 Build završen uspješno!${NC}"