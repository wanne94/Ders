export default {
  expo: {
    name: "Ders",
    slug: "ders-app",
    owner: "wanne",
    scheme: "exp+ders-app",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/images/logo.jpg",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.daije.mobile",
      buildNumber: "1",
      infoPlist: {
        config: {
          usesNonExemptEncryption: false,
        },
        CFBundleAllowMixedLocalizations: true,
        UIRequiresFullScreen: false,
        "UISupportedInterfaceOrientations~iphone": [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortrait",
        ],
        "UISupportedInterfaceOrientations~ipad": [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight",
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight",
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight",
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
          "UIInterfaceOrientationLandscapeLeft",
          "UIInterfaceOrientationLandscapeRight",
        ],
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.daije.mobile",
      versionCode: 5,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "097bf421-56af-45c5-80d6-8f33e3ecdf9e",
      },
    },
    updates: {
      url: "https://u.expo.dev/7d754f7a-231e-4fd1-8d48-22e2d5f1cb7e",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
