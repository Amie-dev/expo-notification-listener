// Reexport the native module. On web, it will be resolved to ExpoNotificationListenerModule.web.ts
// and on native platforms to ExpoNotificationListenerModule.ts
export { default } from './ExpoNotificationListenerModule';
export * from './ExpoNotificationListener.types';
