import { registerWebModule, NativeModule } from 'expo';

// ExpoNotificationListenerModule is not available on the web platform.
class ExpoNotificationListenerModule extends NativeModule<{}> {}

export default registerWebModule(ExpoNotificationListenerModule, 'ExpoNotificationListenerModule');
