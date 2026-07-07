/**
 * File: ExpoNotificationListenerModule.ts
 * Purpose: Bridges and types the native Expo module functions to the TypeScript environment,
 *          including foreground notification listener events.
 */

import { NativeModule, requireNativeModule } from 'expo';

import { ExpoNotification } from './ExpoNotificationListener.types';

type ExpoNotificationListenerEvents = {
  onNotificationPosted: (notification: ExpoNotification) => void;
  onNotificationRemoved: (notification: ExpoNotification) => void;
};

declare class ExpoNotificationListenerModule extends NativeModule<ExpoNotificationListenerEvents> {
  isPermissionGranted(): boolean;
  requestPermission(): void;
  openNotificationSettings(): void;
  getActiveNotifications(): Promise<ExpoNotification[]>;
}

export default requireNativeModule<ExpoNotificationListenerModule>('ExpoNotificationListener');
