#!/bin/bash

# Android EAS Build Wrapper Script
# This ensures all environment variables are properly set for local builds

echo "🔧 Setting up Android build environment..."

# Set Android SDK environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# Set Java environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH

# Verify Android SDK exists
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Error: Android SDK not found at $ANDROID_HOME"
    echo "Please install Android SDK or update the path in this script"
    exit 1
fi

# Verify Java exists
if [ ! -d "$JAVA_HOME" ]; then
    echo "❌ Error: Java not found at $JAVA_HOME"
    echo "Please install Java 17 or update the path in this script"
    exit 1
fi

# Ensure local.properties exists
if [ ! -f "android/local.properties" ]; then
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
    echo "✅ Created android/local.properties"
fi

echo "✅ Android SDK: $ANDROID_HOME"
echo "✅ Java: $JAVA_HOME"
echo ""
echo "🚀 Starting EAS build for Android..."

# Run the EAS build command
eas build --platform android --local --profile production "$@"