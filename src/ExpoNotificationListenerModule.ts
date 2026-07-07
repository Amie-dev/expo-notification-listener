import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoNotificationListenerModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoNotificationListenerModule>('ExpoNotificationListener');
