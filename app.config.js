/**
 * android.versionCode must increment by 1 on every Play Store submission. CI builds set
 * ANDROID_VERSION_CODE to the GitHub Actions run number so this happens automatically instead
 * of relying on someone remembering to bump it by hand; local builds fall back to 1.
 */
const androidVersionCode = Number(process.env.ANDROID_VERSION_CODE ?? 1);

module.exports = {
  expo: {
    name: 'FreshCart',
    slug: 'grocery-app',
    version: '1.0.0',
    scheme: 'freshcart',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.freshcart.app',
      infoPlist: {
        NSCameraUsageDescription: 'FreshCart uses your camera to scan product barcodes at checkout.',
      },
    },
    android: {
      package: 'com.freshcart.app',
      versionCode: androidVersionCode,
      adaptiveIcon: {
        backgroundColor: '#1db567',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['CAMERA'],
      // READ_EXTERNAL_STORAGE (and its modern READ_MEDIA_IMAGES equivalent,
      // added automatically by expo-image-picker's own plugin below) is
      // needed to pick a product photo from the gallery. RECORD_AUDIO,
      // SYSTEM_ALERT_WINDOW, and WRITE_EXTERNAL_STORAGE remain blocked —
      // nothing in this app records audio, draws over other apps, or writes
      // to shared storage, so keeping them out limits the release manifest
      // to what's genuinely justified for Play Store's permissions review.
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'single',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-secure-store',
      [
        'expo-camera',
        {
          cameraPermission: 'FreshCart uses your camera to scan product barcodes at checkout.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'FreshCart uses your photo library to set a product photo.',
          cameraPermission: 'FreshCart uses your camera to take a product photo.',
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/splash-icon.png',
          imageWidth: 160,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
