/**
 * File: NotificationListenerRegistry.kt
 * Purpose: Singleton registry that allows the Expo Notification Listener Module
 *          to receive notification events from the NotificationListenerService.
 */

package expo.modules.notificationlistener

import java.lang.ref.WeakReference

object NotificationListenerRegistry {

  interface Listener {
    fun onNotificationPosted(notificationData: Map<String, Any?>)
    fun onNotificationRemoved(notificationData: Map<String, Any?>)
  }

  @Volatile
  private var listenerRef: WeakReference<Listener>? = null

  @Synchronized
  fun register(listener: Listener) {
    listenerRef = WeakReference(listener)
  }

  @Synchronized
  fun unregister() {
    listenerRef = null
  }

  @Synchronized
  fun getListener(): Listener? {
    return listenerRef?.get()
  }

  fun notifyNotificationPosted(notificationData: Map<String, Any?>) {
    getListener()?.onNotificationPosted(notificationData)
  }

  fun notifyNotificationRemoved(notificationData: Map<String, Any?>) {
    getListener()?.onNotificationRemoved(notificationData)
  }
}
