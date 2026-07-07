/**
 * File: index.ts
 * Purpose: Exposes the primary public TypeScript API of the expo-notification-listener module,
 *          including event listeners, permissions helper, active notification query, and background headless registration.
 */

import { EventSubscription } from 'expo-modules-core';
import { AppRegistry } from 'react-native';

import { ExpoNotification, HeadlessNotificationEvent } from './ExpoNotificationListener.types';
import ExpoNotificationListenerModule from './ExpoNotificationListenerModule';

// Re-export type definitions
export * from './ExpoNotificationListener.types';

/**
 * Checks whether the Notification Listener permission is granted by the system.
 */
export function isPermissionGranted(): boolean {
  return ExpoNotificationListenerModule.isPermissionGranted();
}

/**
 * Navigates the user directly to the Android "Notification Access" setting screen to grant permission.
 */
export function requestPermission(): void {
  ExpoNotificationListenerModule.requestPermission();
}

/**
 * Navigates the user directly to the Android "Notification Access" setting screen.
 */
export function openNotificationSettings(): void {
  ExpoNotificationListenerModule.openNotificationSettings();
}

/**
 * Fetches the currently active notifications posted in the Android status bar.
 * Note: The Notification Listener permission must be granted.
 */
export function getActiveNotifications(): Promise<ExpoNotification[]> {
  return ExpoNotificationListenerModule.getActiveNotifications();
}

/**
 * Subscribes to notifications posted while the app is running (foreground or active background).
 */
export function addNotificationPostedListener(
  listener: (notification: ExpoNotification) => void
): EventSubscription {
  return ExpoNotificationListenerModule.addListener('onNotificationPosted', listener);
}

/**
 * Subscribes to notification removals while the app is running (foreground or active background).
 */
export function addNotificationRemovedListener(
  listener: (notification: ExpoNotification) => void
): EventSubscription {
  return ExpoNotificationListenerModule.addListener('onNotificationRemoved', listener);
}

export const HEADLESS_TASK_NAME = 'ExpoNotificationListenerHeadlessTask';

export type HeadlessTask = (event: HeadlessNotificationEvent) => Promise<void> | void;

/**
 * Registers a Headless JS task to process notifications when the app is in the background or fully closed.
 * This should be called in your index.js / entry point file outside of any component lifecycles.
 */
export function registerHeadlessListener(task: HeadlessTask): void {
  AppRegistry.registerHeadlessTask(HEADLESS_TASK_NAME, () => async (taskData) => {
    try {
      await task(taskData);
    } catch (error) {
      console.error('[expo-notification-listener] Error in headless task:', error);
    }
  });
}
