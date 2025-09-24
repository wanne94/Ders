export default {
  expo: {
    name: "Ders",
    slug: "ders-mobile",
    version: "1.1.7",
    scheme: "ders",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      package: "com.daije.mobile",
      versionCode: 22,
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    ios: {
      bundleIdentifier: "com.daije.mobile"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
            enableProguardInReleaseBuilds: true
          },
          ios: {
            deploymentTarget: "15.1",
            useFrameworks: "static"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "7f91fc40-bde1-4c3b-b0c7-fba7de078f81"
      }
    }
  }
};