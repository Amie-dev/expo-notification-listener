import { NativeModule } from 'expo';
import { ExpoNotification } from './ExpoNotificationListener.types';

type ExpoNotificationListenerEvents = {
  onNotificationPosted: (notification: ExpoNotification) => void;
  onNotificationRemoved: (notification: ExpoNotification) => void;
};

class ExpoNotificationListenerModuleStub extends NativeModule<ExpoNotificationListenerEvents> {
  isPermissionGranted(): boolean {
    return false;
  }

  requestPermission(): void {
    // No-op on unsupported platforms
  }

  openNotificationSettings(): void {
    // No-op on unsupported platforms
  }

  async getActiveNotifications(): Promise<ExpoNotification[]> {
    return [];
  }
}

export default new ExpoNotificationListenerModuleStub();
