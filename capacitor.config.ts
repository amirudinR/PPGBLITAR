import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ppg.samarinda',
  appName: 'PPG Samarinda',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
