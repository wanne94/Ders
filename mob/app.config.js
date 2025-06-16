export default {
  expo: {
    name: "Ders",
    slug: "ders-mobile-app",
    owner: "wanne",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.ders.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
                    color: "#ffffff"
        }
      ],
      "expo-build-properties"
    ],
    extra: {
      eas: {
        projectId: "6088f37c-3438-4b9c-b54a-83165348772b"
      }
    }
  }
};
