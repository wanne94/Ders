export default {
  expo: {
    name: "Ders",
    slug: "ders-app",
    owner: "wanne",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.jpg",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ba.ders.app"
    },
    android: {
      package: "ba.ders.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-build-properties"
    ],
    extra: {
      eas: {
        projectId: "7d754f7a-231e-4fd1-8d48-22e2d5f1cb7e"
      }
    },
    updates: {
      url: "https://u.expo.dev/7d754f7a-231e-4fd1-8d48-22e2d5f1cb7e"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};
