import type { CapacitorConfig } from '@capacitor/cli'

// NOTE: `appId` must match the applicationId already used in android/app/build.gradle if
// this project has an existing Play Store listing — update it to match before building if so.
const config: CapacitorConfig = {
  appId: 'com.footballperformanceplatform.app',
  appName: 'Mini FPP',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#2D7A5B',
      sound: 'default',
    },
  },
}

export default config
