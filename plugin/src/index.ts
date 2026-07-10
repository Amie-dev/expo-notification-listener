/**
 * File: index.ts (Config Plugin)
 * Purpose: Expo Config Plugin to inject BIND_NOTIFICATION_LISTENER_SERVICE,
 *          ExpoNotificationListenerService, and NotificationHeadlessJsTaskService entries into AndroidManifest.xml.
 */

import { ConfigPlugin, withAndroidManifest, AndroidConfig } from '@expo/config-plugins';

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

const withNotificationListenerService: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = getMainApplicationOrThrow(androidManifest);

    // 1. Definition for the Notification Listener Service (cast to any for manifest compatibility)
    const listenerService: any = {
      $: {
        'android:name': 'expo.modules.notificationlistener.ExpoNotificationListenerService',
        'android:label': 'Expo Notification Listener',
        'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.service.notification.NotificationListenerService',
              },
            },
          ],
        },
      ],
    };

    // 2. Definition for the React Native Headless JS Task Service (cast to any for manifest compatibility)
    const headlessService: any = {
      $: {
        'android:name': 'expo.modules.notificationlistener.NotificationHeadlessJsTaskService',
        'android:exported': 'false',
      },
    };

    // Initialize service list if it doesn't exist
    mainApplication.service = mainApplication.service || [];
    const services = mainApplication.service;

    // Avoid duplicate service declarations
    const hasListener = services.some(
      (s: any) => s.$['android:name'] === 'expo.modules.notificationlistener.ExpoNotificationListenerService'
    );
    if (!hasListener) {
      services.push(listenerService);
    }

    const hasHeadless = services.some(
      (s: any) => s.$['android:name'] === 'expo.modules.notificationlistener.NotificationHeadlessJsTaskService'
    );
    if (!hasHeadless) {
      services.push(headlessService);
    }

    return config;
  });
};

export default withNotificationListenerService;
