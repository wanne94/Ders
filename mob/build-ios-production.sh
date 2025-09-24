#!/bin/bash

# Build iOS without Expo dependencies
# This script creates a production build using standard React Native/Xcode tools

set -e

echo "Building iOS app without Expo..."

# Navigate to iOS directory
cd ios

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/Ders-*

# Remove Expo Configure script phase from Xcode project
echo "Removing Expo script phases from Xcode project..."
ruby -e "
require 'xcodeproj'
project_path = 'Ders.xcodeproj'
project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  if target.name == 'Ders'
    # Remove Expo Configure script phase
    target.build_phases.each do |phase|
      if phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
        if phase.name == '[Expo] Configure project'
          puts 'Removing Expo Configure script phase...'
          phase.remove_from_project
        end
      end
    end
  end
end

project.save
puts 'Xcode project updated successfully'
"

# Build the archive
echo "Building iOS archive..."
xcodebuild -workspace Ders.xcworkspace \
  -scheme Ders \
  -configuration Release \
  -sdk iphoneos \
  -destination "generic/platform=iOS" \
  -archivePath build/Ders.xcarchive \
  archive

echo "Build completed successfully!"
echo "Archive location: ios/build/Ders.xcarchive"

# Optional: Export IPA file
read -p "Do you want to export the IPA file? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Exporting IPA..."
  xcodebuild -exportArchive \
    -archivePath build/Ders.xcarchive \
    -exportPath build \
    -exportOptionsPlist ExportOptions.plist

  echo "IPA exported to: ios/build/Ders.ipa"
fi
