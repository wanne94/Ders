export default {
  expo: {
    name: "Ders",
    slug: "ders-mobile",
    version: "1.2.0",
    scheme: "ders",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      package: "com.daije.mobile",
      versionCode: 26,
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    ios: {
      bundleIdentifier: "com.daije.mobile",
      buildNumber: "26",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "Ders koristi vaše fotografije kako biste dodali ili uredili slike profila daija, organizacija i predavanja.",
        NSCalendarsUsageDescription:
          "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili podsjetnike prije početka.",
        NSCalendarsFullAccessUsageDescription:
          "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili podsjetnike prije početka."
      }
    },
    plugins: [
      "expo-font",
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
            useFrameworks: "static",
            podfileProperties: {
              "use_modular_headers!": true
            }
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
