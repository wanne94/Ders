#!/bin/bash

echo "🚀 Quick AAB build (bez clean)..."

# Set NODE_ENV
export NODE_ENV=production

# Build AAB direktno
cd android && ./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo "✅ Build završen!"
    echo "📍 AAB: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "❌ Build neuspješan!"
fi