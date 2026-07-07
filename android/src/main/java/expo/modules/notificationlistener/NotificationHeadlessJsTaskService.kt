/**
 * File: NotificationHeadlessJsTaskService.kt
 * Purpose: Android service extending HeadlessJsTaskService to trigger a
 *          React Native Headless JS task for background notification handling.
 */

package expo.modules.notificationlistener

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class NotificationHeadlessJsTaskService : HeadlessJsTaskService() {

  /**
   * Defines the task configuration (name, payload, timeout) that React Native will run in the background.
   */
  override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
    val extras = intent.extras ?: return null
    return HeadlessJsTaskConfig(
      "ExpoNotificationListenerHeadlessTask", // Task name to register via AppRegistry
      Arguments.fromBundle(extras),
      5000L, // Timeout of 5 seconds for execution
      true   // Allowed to run even if the app is in the foreground
    )
  }
}
