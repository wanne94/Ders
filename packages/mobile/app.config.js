export default {
  expo: {
    name: "Ders",
    slug: "ders-mobile",
    version: "1.3.1",
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
      buildNumber: "36",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "Ders koristi kameru da fotografišete slike profila daija, organizacija i predavanja. Na primjer, možete direktno fotografisati sliku umjesto da je birate iz galerije.",
        NSPhotoLibraryUsageDescription:
          "Ders koristi galeriju fotografija da odaberete i učitate slike profila daija, organizacija i predavanja. Na primjer, možete odabrati postojeću fotografiju sa vašeg uređaja za sliku profila daije.",
        NSCalendarsUsageDescription:
          "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili automatske podsjetnike prije početka. Na primjer, kada dodate predavanje u kalendar, primit ćete notifikaciju 15 minuta prije početka.",
        NSCalendarsFullAccessUsageDescription:
          "Ders dodaje odabrana predavanja u vaš kalendar kako biste dobili automatske podsjetnike prije početka. Na primjer, kada dodate predavanje u kalendar, primit ćete notifikaciju 15 minuta prije početka."
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
