# Project Plan: Expo to Pure React Native Android SDK Analysis

## Task: Analyze Expo build system for removal to convert to pure Android Studio SDK build

### Todo List:
- [x] Analyze package.json for Expo dependencies and build tools
- [x] Examine app.config.js for Expo build plugins and configurations
- [x] Check android/build.gradle for Expo gradle plugins
- [x] Review android/app/build.gradle for Expo-specific configurations
- [x] Inspect android/settings.gradle for Expo plugin includes
- [x] Search for Expo build scripts and configuration files
- [x] Analyze Metro configuration for Expo-specific settings
- [x] Identify essential vs build-only Expo packages
- [x] Document removal recommendations and migration strategy

### Status: Analysis completed - ready for migration planning

## Detailed Analysis Results

### 1. EXPO DEPENDENCIES TO REMOVE (Build-only packages):
**Core Expo Build System:**
- `expo` (53.0.20) - Main SDK
- `expo-dev-client` (~5.2.4) - Development client
- `expo-updates` (~0.28.17) - OTA updates system
- `@expo/config-plugins` (~10.1.1) - Build plugins
- `@expo/prebuild-config` (~9.0.0) - Prebuild system
- `eslint-config-expo` (~9.2.0) - ESLint configuration
- `babel-preset-expo` - Babel preset

**Build Tools:**
- `@expo/ngrok` (^4.1.3) - Tunneling for development
- `expo-build-properties` (~0.14.6) - Build configuration plugin

### 2. EXPO PACKAGES TO KEEP (Functional dependencies):
**Essential Expo Modules (provide actual functionality):**
- `@expo/vector-icons` (^14.1.0) - Icon library
- `expo-calendar` (^14.1.4) - Calendar access
- `expo-image-picker` (~16.1.4) - Image picking functionality
- `expo-linear-gradient` (~14.1.5) - Gradient components
- `expo-status-bar` (~2.2.3) - Status bar management

### 3. GRADLE CONFIGURATIONS TO REMOVE:
**android/build.gradle:**
- Line 36: `apply plugin: "expo-root-project"`

**android/settings.gradle:**
- Lines 10-17: Expo plugins path resolution
- Line 22: `id("expo-autolinking-settings")`
- Lines 26-31: Expo autolinking configuration
- Line 32: `expoAutolinking.useExpoModules()`
- Line 36: `expoAutolinking.useExpoVersionCatalog()`
- Line 39: `includeBuild(expoAutolinking.reactNativeGradlePlugin)`

**android/app/build.gradle:**
- Line 12: Expo entry file resolution
- Lines 20-21: Expo CLI bundling configuration
- Line 128: `useLegacyPackaging` expo property

**android/gradle.properties:**
- Lines 44-56: All expo.* properties
- Line 53: `EX_DEV_CLIENT_NETWORK_INSPECTOR`
- Line 59: `expo.edgeToEdgeEnabled`

### 4. CONFIGURATION FILES TO REPLACE:
**Metro Configuration:**
- Replace `expo/metro-config` with standard React Native metro config
- Remove Expo-specific resolver configurations

**Babel Configuration:**
- Replace `babel-preset-expo` with `@react-native/babel-preset`

**Build Scripts:**
- Remove all expo-based build commands from package.json
- Replace build-android.sh to use pure gradle commands

### 5. FILES TO REMOVE:
- `app.config.js` - Expo app configuration
- `eas.json` - Expo Application Services config
- `check-expo-network.js` - Expo network checking script

### 6. MIGRATION STRATEGY:

#### Phase 1: Backup and Preparation
- Create backup of current Android configuration
- Document current app functionality

#### Phase 2: Dependency Cleanup
- Remove Expo build dependencies from package.json
- Keep functional Expo modules that provide actual features
- Replace Expo presets with React Native equivalents

#### Phase 3: Build System Migration
- Remove Expo gradle plugins and configurations
- Set up pure React Native Android build configuration
- Replace entry point resolution with standard index.js

#### Phase 4: Configuration Updates
- Update Metro config for standard React Native
- Update Babel config to use React Native preset
- Create new build scripts using gradle directly

#### Phase 5: Testing and Validation
- Test app functionality with new build system
- Verify all features work without Expo runtime
- Update development and production build processes

### 7. RISKS AND CONSIDERATIONS:
- Some Expo modules may require native equivalents
- Build process will be more manual but more controllable
- Development experience may change (no Expo Go)
- OTA updates will need alternative solution if required