#!/bin/bash

# iOS App Store Build Script - Potpuno lokalno bez Expo/EAS
# Ovaj script kreira produkcijski IPA fajl spreman za Transporter

set -e  # Exit on error

echo "🚀 Starting iOS App Store Build (Lokalno bez Expo)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Ders"
SCHEME_NAME="Ders"
CONFIGURATION="Release"
WORKSPACE_PATH="ios/${PROJECT_NAME}.xcworkspace"
ARCHIVE_PATH="ios/build/${PROJECT_NAME}-AppStore.xcarchive"
EXPORT_PATH="ios/build/AppStore"
EXPORT_OPTIONS_PLIST="ios/ExportOptions-AppStore.plist"
TEAM_ID="9Y9WRB4KLV"
BUNDLE_ID="com.daije.mobile"

# Clean function
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    rm -rf ios/build/AppStore
    rm -rf ios/build/${PROJECT_NAME}-AppStore.xcarchive
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode is not installed${NC}"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -d "ios" ]; then
        echo -e "${RED}❌ ios directory not found. Please run from mob directory${NC}"
        exit 1
    fi
    
    # Check signing identity
    echo -e "${BLUE}🔐 Checking signing certificates...${NC}"
    security find-identity -v -p codesigning | grep "$TEAM_ID" > /dev/null
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  No signing certificate found for Team ID: $TEAM_ID${NC}"
        echo -e "${YELLOW}   You may need to sign in to Xcode with your Apple ID${NC}"
    else
        echo -e "${GREEN}✅ Signing certificate found${NC}"
    fi
}

# Build archive
build_archive() {
    echo -e "${BLUE}🔨 Building Release Archive...${NC}"
    
    # Clean previous builds
    cleanup
    mkdir -p ios/build/AppStore
    
    # Set production environment
    export NODE_ENV=production
    export EXPO_ENV=production
    
    # Build archive with automatic signing
    DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
    xcodebuild -workspace "$WORKSPACE_PATH" \
        -scheme "$SCHEME_NAME" \
        -configuration "$CONFIGURATION" \
        -archivePath "$ARCHIVE_PATH" \
        -destination "generic/platform=iOS" \
        -allowProvisioningUpdates \
        -allowProvisioningDeviceRegistration \
        DEVELOPMENT_TEAM="$TEAM_ID" \
        PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID" \
        CODE_SIGN_STYLE="Automatic" \
        clean archive
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Archive build failed!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Archive created successfully!${NC}"
}

# Export IPA
export_ipa() {
    echo -e "${BLUE}📱 Exporting IPA for App Store...${NC}"
    
    DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
    xcodebuild -exportArchive \
        -archivePath "$ARCHIVE_PATH" \
        -exportPath "$EXPORT_PATH" \
        -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
        -allowProvisioningUpdates
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ IPA export failed!${NC}"
        echo -e "${YELLOW}Trying with development certificate...${NC}"
        
        # Fallback to development build
        sed -i '' 's/app-store-connect/development/g' "$EXPORT_OPTIONS_PLIST"
        
        DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
        xcodebuild -exportArchive \
            -archivePath "$ARCHIVE_PATH" \
            -exportPath "$EXPORT_PATH" \
            -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
            -allowProvisioningUpdates
        
        # Restore original
        sed -i '' 's/development/app-store-connect/g' "$EXPORT_OPTIONS_PLIST"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Export failed completely${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ IPA exported successfully!${NC}"
}

# Verify build
verify_build() {
    echo -e "${BLUE}🔍 Verifying build...${NC}"
    
    IPA_FILE="$EXPORT_PATH/${PROJECT_NAME}.ipa"
    
    if [ -f "$IPA_FILE" ]; then
        # Get IPA info
        IPA_SIZE=$(du -h "$IPA_FILE" | cut -f1)
        echo -e "${GREEN}✅ IPA file created: $IPA_FILE${NC}"
        echo -e "${GREEN}   Size: $IPA_SIZE${NC}"
        
        # Extract some info from IPA
        unzip -l "$IPA_FILE" | head -20
        
        echo ""
        echo -e "${GREEN}🎉 BUILD SUCCESSFUL!${NC}"
        echo ""
        echo -e "${BLUE}📤 Next steps:${NC}"
        echo "1. Open Transporter app (download from Mac App Store)"
        echo "2. Sign in with your Apple ID"
        echo "3. Drag and drop the IPA file:"
        echo -e "   ${GREEN}$IPA_FILE${NC}"
        echo "4. Click 'Deliver' to upload to App Store Connect"
        echo ""
        echo -e "${YELLOW}Alternative upload methods:${NC}"
        echo "• Using Xcode Organizer:"
        echo "  - Window → Organizer → Select archive → Distribute App"
        echo ""
        echo "• Using command line:"
        echo "  xcrun altool --upload-app -f \"$IPA_FILE\" -u YOUR_APPLE_ID -p APP_SPECIFIC_PASSWORD"
        echo ""
        echo -e "${BLUE}📱 App Store Connect:${NC}"
        echo "After upload, go to https://appstoreconnect.apple.com to:"
        echo "• Submit for review"
        echo "• Configure TestFlight"
        echo "• Manage app metadata"
    else
        echo -e "${RED}❌ IPA file not found!${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   iOS App Store Build - Local Production${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    
    check_prerequisites
    build_archive
    export_ipa
    verify_build
}

# Run main function
main