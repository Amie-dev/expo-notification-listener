/**
 * File: NotificationParser.kt
 * Purpose: Formats Android StatusBarNotification metadata into serializable Kotlin Maps,
 *          safely resolving app names and serializing Bundle extras.
 */

package expo.modules.notificationlistener

import android.app.Notification
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import android.service.notification.StatusBarNotification

object NotificationParser {

  /**
   * Main entry point to extract notification fields into a serializable Map.
   */
  fun parse(context: Context, sbn: StatusBarNotification): Map<String, Any?> {
    val notification = sbn.notification
    val extras = notification.extras ?: Bundle()
    val packageName = sbn.packageName

    // 1. Get readable App Name using the PackageManager
    val appName = getAppName(context, packageName)

    // 2. Safely extract standard notification text fields
    val title = getCharSequenceString(extras, Notification.EXTRA_TITLE)
    val text = getCharSequenceString(extras, Notification.EXTRA_TEXT)
    val subText = getCharSequenceString(extras, Notification.EXTRA_SUB_TEXT)
    val bigText = getCharSequenceString(extras, Notification.EXTRA_BIG_TEXT)

    // 3. Serialize extras Bundle into a flat Map, excluding complex non-serializable objects (like Bitmaps)
    val parsedExtras = parseBundleToMap(extras)

    return mapOf(
      "id" to sbn.id,
      "key" to sbn.key,
      "packageName" to packageName,
      "appName" to appName,
      "title" to title,
      "text" to text,
      "subText" to subText,
      "bigText" to bigText,
      "timestamp" to sbn.postTime,
      "ongoing" to sbn.isOngoing,
      "clearable" to sbn.isClearable,
      "category" to notification.category,
      "extras" to parsedExtras
    )
  }

  /**
   * Resolves the app label (e.g. "Gmail") from its package name (e.g. "com.google.android.gm").
   */
  private fun getAppName(context: Context, packageName: String): String {
    return try {
      val pm = context.packageManager
      val appInfo = pm.getApplicationInfo(packageName, 0)
      pm.getApplicationLabel(appInfo).toString()
    } catch (e: PackageManager.NameNotFoundException) {
      packageName // Fallback to package name if name cannot be loaded
    }
  }

  private fun getCharSequenceString(bundle: Bundle, key: String): String? {
    return bundle.getCharSequence(key)?.toString()
  }

  /**
   * Standardizes the Bundle extras to a flat Map, keeping only serializable primitives to avoid bridge crashes.
   */
  private fun parseBundleToMap(bundle: Bundle): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()
    val keys = bundle.keySet()
    for (key in keys) {
      try {
        val value = bundle.get(key)
        if (value != null && isPrimitiveOrString(value)) {
          map[key] = value
        }
      } catch (e: Exception) {
        // Skip keys that fail to deserialize or cause classloader issues
      }
    }
    return map
  }

  /**
   * Helper to ensure we only send serializable values to JS.
   */
  private fun isPrimitiveOrString(value: Any): Boolean {
    return value is String ||
           value is Int ||
           value is Long ||
           value is Double ||
           value is Float ||
           value is Boolean ||
           value is Byte ||
           value is Short ||
           value is Char
  }
}
