/**
 * File: ExpoNotificationListenerModule.kt
 * Purpose: Native Kotlin module definition for Expo.
 *          Exposes check/request permissions, active notification polling, and registers Event Emitters.
 */

package expo.modules.notificationlistener

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNotificationListenerModule : Module(), NotificationListenerRegistry.Listener {

  override fun definition() = ModuleDefinition {
    Name("ExpoNotificationListener")

    // 1. Declare event emitters
    Events("onNotificationPosted", "onNotificationRemoved")

    // 2. Lifecycle hooks
    OnCreate {
      NotificationListenerRegistry.register(this@ExpoNotificationListenerModule)
      rebindService()
    }

    OnDestroy {
      NotificationListenerRegistry.unregister()
    }

    // 3. Exported functions
    Function("isPermissionGranted") {
      val context = appContext.reactContext ?: return@Function false
      val packageName = context.packageName
      val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
      if (!flat.isNullOrEmpty()) {
        val names = flat.split(":")
        for (name in names) {
          val cn = ComponentName.unflattenFromString(name)
          if (cn != null && cn.packageName == packageName) {
            return@Function true
          }
        }
      }
      false
    }

    Function("requestPermission") {
      openNotificationSettings()
    }

    Function("openNotificationSettings") {
      openNotificationSettings()
    }

    AsyncFunction("getActiveNotifications") {
      val service = ExpoNotificationListenerService.getActiveInstance() ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      val activeNotifications = try {
        service.activeNotifications
      } catch (e: Exception) {
        null
      }

      activeNotifications?.map { sbn ->
        NotificationParser.parse(service.applicationContext, sbn)
      } ?: emptyList()
    }
  }

  // 4. Implement registry listeners to fire emitter events to JavaScript
  override fun onNotificationPosted(notificationData: Map<String, Any?>) {
    sendEvent("onNotificationPosted", notificationData)
  }

  override fun onNotificationRemoved(notificationData: Map<String, Any?>) {
    sendEvent("onNotificationRemoved", notificationData)
  }

  private fun openNotificationSettings() {
    val context = appContext.reactContext ?: return
    val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
  }

  /**
   * Helper to ensure the NotificationListenerService is bound and running.
   * Helps recover from process restarts or system memory pressure kills.
   */
  private fun rebindService() {
    try {
      val context = appContext.reactContext ?: return
      val componentName = ComponentName(context, ExpoNotificationListenerService::class.java)
      ExpoNotificationListenerService.requestRebind(componentName)
    } catch (e: Exception) {
      // Rebind is only supported on Android SDK 24+
    }
  }
}
