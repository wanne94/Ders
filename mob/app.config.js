export default {
  expo: {
    name: "ders",
    slug: "mobile-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Ova aplikacija koristi kameru za dodavanje slika u sadržaj.",
        NSPhotoLibraryUsageDescription: "Ova aplikacija pristupa galeriji slika za dodavanje slika u sadržaj."
      }
    },
    android: {
      package: "com.wanne.mobileapp",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "Ova aplikacija pristupa galeriji slika za dodavanje slika u sadržaj.",
          cameraPermission: "Ova aplikacija koristi kameru za dodavanje slika u sadržaj."
        }
      ]
    ],
    // Optimizacije za smanjenje veličine build-a
    assetBundlePatterns: [
      "assets/**/*"
    ],
    updates: {
      fallbackToCacheTimeout: 0
    },
    extra: {
      eas: {
        projectId: "6a6c13f8-0b9e-477a-adc1-867f4ad1861c"
      }
    }
  }
}; 