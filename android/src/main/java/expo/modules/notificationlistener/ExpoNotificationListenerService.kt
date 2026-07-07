/**
 * File: ExpoNotificationListenerService.kt
 * Purpose: Android service extending NotificationListenerService.
 *          Receives events from the OS, parses them, and delegates them to the registry or Headless JS.
 *          Maintains a thread-safe active reference to support active notification fetching.
 */

package expo.modules.notificationlistener

import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class ExpoNotificationListenerService : NotificationListenerService() {

  companion object {
    private const val TAG = "ExpoNotificationListenerService"

    @Volatile
    private var activeInstance: ExpoNotificationListenerService? = null

    fun getActiveInstance(): ExpoNotificationListenerService? {
      return activeInstance
    }
  }

  override fun onListenerConnected() {
    super.onListenerConnected()
    activeInstance = this
    Log.d(TAG, "Notification listener connected.")
  }

  override fun onListenerDisconnected() {
    super.onListenerDisconnected()
    if (activeInstance == this) {
      activeInstance = null
    }
    Log.d(TAG, "Notification listener disconnected.")
  }

  override fun onDestroy() {
    super.onDestroy()
    if (activeInstance == this) {
      activeInstance = null
    }
    Log.d(TAG, "Notification listener destroyed.")
  }

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) return
    try {
      val parsed = NotificationParser.parse(applicationContext, sbn)

      // 1. Notify active foreground listeners via registry
      val hasListener = NotificationListenerRegistry.getListener() != null
      if (hasListener) {
        NotificationListenerRegistry.notifyNotificationPosted(parsed)
      }

      // 2. Always attempt to trigger the background Headless JS task
      triggerHeadlessTask(parsed, "notificationReceived")

    } catch (e: Exception) {
      Log.e(TAG, "Error in onNotificationPosted", e)
    }
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification?) {
    if (sbn == null) return
    try {
      val parsed = NotificationParser.parse(applicationContext, sbn)

      // 1. Notify active foreground listeners via registry
      val hasListener = NotificationListenerRegistry.getListener() != null
      if (hasListener) {
        NotificationListenerRegistry.notifyNotificationRemoved(parsed)
      }

      // 2. Always attempt to trigger the background Headless JS task
      triggerHeadlessTask(parsed, "notificationRemoved")

    } catch (e: Exception) {
      Log.e(TAG, "Error in onNotificationRemoved", e)
    }
  }

  /**
   * Spawns the Headless JS Service to handle notifications in the background/when app is terminated.
   */
  private fun triggerHeadlessTask(parsedData: Map<String, Any?>, eventName: String) {
    try {
      val intent = Intent(applicationContext, NotificationHeadlessJsTaskService::class.java)
      val bundle = Bundle().apply {
        putString("eventName", eventName)
        // Put standard fields
        putInt("id", parsedData["id"] as? Int ?: 0)
        putString("key", parsedData["key"] as? String ?: "")
        putString("packageName", parsedData["packageName"] as? String ?: "")
        putString("appName", parsedData["appName"] as? String ?: "")
        putString("title", parsedData["title"] as? String)
        putString("text", parsedData["text"] as? String)
        putString("subText", parsedData["subText"] as? String)
        putString("bigText", parsedData["bigText"] as? String)
        putLong("timestamp", parsedData["timestamp"] as? Long ?: 0L)
        putBoolean("ongoing", parsedData["ongoing"] as? Boolean ?: false)
        putBoolean("clearable", parsedData["clearable"] as? Boolean ?: false)
        putString("category", parsedData["category"] as? String)
        
        // Handle nested extras map
        val extrasData = parsedData["extras"] as? Map<*, *>
        if (extrasData != null) {
          val extrasBundle = Bundle()
          for ((k, v) in extrasData) {
            if (k is String) {
              when (v) {
                is String -> extrasBundle.putString(k, v)
                is Int -> extrasBundle.putInt(k, v)
                is Long -> extrasBundle.putLong(k, v)
                is Double -> extrasBundle.putDouble(k, v)
                is Float -> extrasBundle.putFloat(k, v)
                is Boolean -> extrasBundle.putBoolean(k, v)
              }
            }
          }
          putBundle("extras", extrasBundle)
        }
      }
      intent.putExtras(bundle)
      applicationContext.startService(intent)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to start Headless JS service", e)
    }
  }
}
