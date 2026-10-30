import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aniplayer.app',
  appName: 'AniPlayer',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
    },
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'aniplayer',
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
  }
};

export default config;
