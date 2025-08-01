#!/bin/bash

echo "🚀 Starting AAB build process..."

# Set NODE_ENV
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean

# Build AAB
echo "📦 Building AAB file..."
./gradlew bundleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📍 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
    
    # Copy to root directory for easy access
    cp app/build/outputs/bundle/release/app-release.aab ../Ders-release.aab
    echo "📋 Copied to: mob/Ders-release.aab"
else
    echo "❌ Build failed!"
    exit 1
fi