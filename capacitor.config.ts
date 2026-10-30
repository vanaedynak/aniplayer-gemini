import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anigemini.app',
  appName: 'AniGemini',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
    },
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'anigemini',
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
  }
};

export default config;
