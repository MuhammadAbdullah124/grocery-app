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
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: ['CAMERA'],
      // These get pulled in by dependencies (expo-camera's video-recording support,
      // react-native's dev-menu overlay, etc.) but nothing in this app actually uses
      // audio recording, draw-over-other-apps, or local file storage — blocking them
      // keeps the release manifest limited to what's genuinely justified for Play
      // Store's permissions review.
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
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
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/icon.png',
          imageWidth: 160,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
