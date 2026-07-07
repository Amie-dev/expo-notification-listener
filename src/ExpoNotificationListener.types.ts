/**
 * File: ExpoNotificationListener.types.ts
 * Purpose: Defines TypeScript interfaces and types for notifications, events, and settings.
 */

export interface ExpoNotification {
  /**
   * The notification ID.
   */
  id: number;

  /**
   * The unique system key for the notification.
   */
  key: string;

  /**
   * The package name of the application that sent the notification (e.g. "com.whatsapp").
   */
  packageName: string;

  /**
   * The readable display name of the application (e.g. "WhatsApp").
   */
  appName: string;

  /**
   * The title text of the notification, if available.
   */
  title: string | null;

  /**
   * The main body text of the notification, if available.
   */
  text: string | null;

  /**
   * Sub-text associated with the notification, if any.
   */
  subText: string | null;

  /**
   * Large body text (for big-text style notifications), if any.
   */
  bigText: string | null;

  /**
   * The post time of the notification in milliseconds since epoch.
   */
  timestamp: number;

  /**
   * Whether the notification is ongoing (e.g., active phone call, music controller).
   */
  ongoing: boolean;

  /**
   * Whether the notification can be cleared by the user.
   */
  clearable: boolean;

  /**
   * The Android category of the notification (e.g. "msg", "promo", "call").
   */
  category: string | null;

  /**
   * Key-value dictionary containing primitive extras bundled with the notification.
   */
  extras: Record<string, string | number | boolean | null>;
}

export interface HeadlessNotificationEvent extends ExpoNotification {
  /**
   * The background action that triggered this headless event.
   */
  eventName: 'notificationReceived' | 'notificationRemoved';
}
