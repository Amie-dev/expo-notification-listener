import { registerWebModule, NativeModule } from 'expo';
import { ExpoNotification } from './ExpoNotificationListener.types';

class ExpoNotificationListenerModule extends NativeModule<{}> {
  isPermissionGranted(): boolean {
    return false;
  }

  requestPermission(): void {
    // No-op on web
  }

  openNotificationSettings(): void {
    // No-op on web
  }

  async getActiveNotifications(): Promise<ExpoNotification[]> {
    return [];
  }
}

export default registerWebModule(ExpoNotificationListenerModule, 'ExpoNotificationListener');
