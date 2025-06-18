#!/bin/bash

# Upload keystore to EAS and build
echo "Starting Android production build..."

# First, let's try to build with existing keystore
export EAS_NO_VCS=1

# Build command
eas build --platform android --profile production --message "Production build with Ders-app-produkcija keystore"

echo "Build started. Check the build status with: eas build:list"