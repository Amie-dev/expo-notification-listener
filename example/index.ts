/**
 * File: index.ts (Example App Entry)
 * Purpose: Registers the entry point of the React Native app and registers the
 *          background headless notification event listener.
 */

import { registerRootComponent } from 'expo';
import { registerHeadlessListener } from 'expo-notification-listener';
import App from './App';

// Register the background notification listener
// This task runs in a background JS environment when the app is backgrounded or killed
registerHeadlessListener(async (event) => {
  console.log('[Background Task] Notification Event Received:', event.eventName);
  console.log(`Package: ${event.packageName} | App: ${event.appName}`);
  console.log(`Title: ${event.title} | Text: ${event.text}`);
  console.log('Timestamp:', new Date(event.timestamp).toLocaleTimeString());
});

registerRootComponent(App);
