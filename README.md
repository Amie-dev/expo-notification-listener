# expo-notification-listener

A production-ready Expo module that wraps Android's native `NotificationListenerService` using the modern Expo Modules API. It enables apps to listen to incoming and cleared notifications from other apps both while running and in the background (including when the app is fully terminated).

> [!IMPORTANT]
> **Android Only**: This module is platform-specific and only supports Android 12+ (SDK 31+) and Expo SDK 54+. On iOS/Web, it resolves to safe stubs.

---

## Features

- **Permission Checking & Requesting**: Easily check if the user has granted the "Notification Access" permission and navigate them directly to the settings screen.
- **Active Notifications Retrieval**: Retrieve a list of all currently visible notifications in the status bar.
- **Real-time Event Emitting**: Listen to incoming notifications and notification removals in real time.
- **Background & Terminated Listening**: Execute JavaScript code when a notification is posted or removed while the app is closed/in the background, powered by React Native Headless JS.
- **Detailed Notification Details**: Access parsed notification details:
  - App Name & Package Name
  - Title, Content text, Sub-text, and Big-text
  - Notification Timestamp
  - Ongoing status (e.g., active calls, music players)
  - Clearable state
  - Original extras (primitive maps)

---

## Installation

You can install this package using your preferred package manager:

```bash
# Using Expo CLI (Recommended for automated dependency matching)
npx expo install expo-notification-listener

# Using npm
npm install expo-notification-listener

# Using Yarn
yarn add expo-notification-listener

# Using pnpm
pnpm add expo-notification-listener
```

---

## Configuration

Since this library hooks into Android's native listener system, it requires registration of background services in your `AndroidManifest.xml`. The library handles this automatically via its **Config Plugin**.

Add the config plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "plugins": [
      "expo-notification-listener"
    ]
  }
}
```

After adding the plugin, run a prebuild to configure your native files:

```bash
npx expo prebuild --platform android
```

---

## Usage Guide

### 1. Check and Request Permissions

Android requires users to manually enable "Notification Access" in the system settings. This module cannot display a runtime dialog, but it provides helper functions to check the status and open the settings screen directly.

```typescript
import { useState, useEffect } from 'react';
import { View, Text, Button, AppState } from 'react-native';
import * as NotificationListener from 'expo-notification-listener';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);

  const checkAccess = () => {
    const granted = NotificationListener.isPermissionGranted();
    setHasPermission(granted);
  };

  useEffect(() => {
    checkAccess();

    // Recheck permission when user returns from settings screen
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAccess();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notification Access: {hasPermission ? 'Granted' : 'Denied'}</Text>
      {!hasPermission && (
        <Button 
          title="Grant Notification Permission" 
          onPress={() => NotificationListener.requestPermission()} 
        />
      )}
    </View>
  );
}
```

---

### 2. Live Notification Emitters (App Running)

When the app is open (in the foreground or active in the background), you can register listeners to receive instant notifications:

```typescript
import { useEffect } from 'react';
import * as NotificationListener from 'expo-notification-listener';

export default function NotificationTracker() {
  useEffect(() => {
    // 1. Subscribe to incoming notifications
    const postedSubscription = NotificationListener.addNotificationPostedListener((notification) => {
      console.log('New Notification Posted:');
      console.log(`App: ${notification.appName} (${notification.packageName})`);
      console.log(`Title: ${notification.title}`);
      console.log(`Body: ${notification.text}`);
    });

    // 2. Subscribe to notification removals (dismissed by user or app)
    const removedSubscription = NotificationListener.addNotificationRemovedListener((notification) => {
      console.log(`Notification Dismissed from app: ${notification.appName}`);
    });

    return () => {
      postedSubscription.remove();
      removedSubscription.remove();
    };
  }, []);

  return null;
}
```

---

### 3. Background / Terminated Task Listener (Headless JS)

To listen to notifications when your application is **fully closed** or backgrounded, you must register a **Headless JS Listener**.

Add this registration at the very top of your entry file (usually `index.js` or `index.ts` at the root of your project, *outside* of any React components):

```typescript
import { registerRootComponent } from 'expo';
import { registerHeadlessListener } from 'expo-notification-listener';
import App from './App';

// Register background task (Runs in a separate thread when app is backgrounded or killed)
registerHeadlessListener(async (event) => {
  const { eventName, appName, packageName, title, text, timestamp } = event;

  if (eventName === 'notificationReceived') {
    console.log(`[Headless JS] Incoming notification from ${appName} (${packageName}):`);
    console.log(`Title: ${title} | Text: ${text}`);
    
    // Perform background tasks here (e.g. store in SQLite/MMKV, send to a backend server, etc.)
  } else if (eventName === 'notificationRemoved') {
    console.log(`[Headless JS] Notification cleared from ${appName}`);
  }
});

registerRootComponent(App);
```

---

### 4. Fetch Active Notifications

You can query all notifications currently sitting in the Android status bar at any time:

```typescript
import * as NotificationListener from 'expo-notification-listener';

async function fetchVisibleNotifications() {
  const active = await NotificationListener.getActiveNotifications();
  console.log(`Found ${active.length} active notifications:`);
  
  active.forEach((notif) => {
    console.log(`- [${notif.appName}] ${notif.title}: ${notif.text}`);
  });
}
```

---

## API Reference

### Data Types

#### `ExpoNotification`

```typescript
interface ExpoNotification {
  id: number;
  key: string;
  packageName: string;
  appName: string;
  title: string | null;
  text: string | null;
  subText: string | null;
  bigText: string | null;
  timestamp: number;
  ongoing: boolean;
  clearable: boolean;
  category: string | null;
  extras: Record<string, string | number | boolean | null>;
}
```

#### `HeadlessNotificationEvent`

Extends `ExpoNotification` and adds:

```typescript
interface HeadlessNotificationEvent extends ExpoNotification {
  eventName: 'notificationReceived' | 'notificationRemoved';
}
```

---

## Troubleshooting

### Why aren't events triggering on device?
1. Ensure you have granted the permission manually. Navigate to **Settings** -> **Apps** -> **Special App Access** -> **Device & App Notifications** (or search "Notification Access" in Settings) and ensure your application is switched ON.
2. In some Chinese ROMs (MIUI/HyperOS, ColorOS, etc.), apps are restricted from running background services. Go to App Info -> Enable **Autostart** / disable Battery Saver optimization for your app.
3. If you have just reloaded/re-run the app through metro, Android might sometimes disable listener bindings. Call `NotificationListener.requestPermission()` to trigger settings or trigger a fresh build.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
