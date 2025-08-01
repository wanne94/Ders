#!/bin/bash

echo "🚀 Starting APK build process..."

# Set NODE_ENV
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean

# Build APK
echo "📦 Building APK file..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📍 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy to root directory for easy access
    cp app/build/outputs/apk/release/app-release.apk ../Ders-release.apk
    echo "📋 Copied to: mob/Ders-release.apk"
else
    echo "❌ Build failed!"
    exit 1
fi