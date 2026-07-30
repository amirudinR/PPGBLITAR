import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ppg.blitar',
  appName: 'PPG BLITAR',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
