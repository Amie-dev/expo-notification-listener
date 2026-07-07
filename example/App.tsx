/**
 * File: App.tsx (Example App UI)
 * Purpose: Interactive React Native demonstration UI for testing and verifying
 *          the expo-notification-listener package.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  AppState
} from 'react-native';
import {
  isPermissionGranted,
  requestPermission,
  openNotificationSettings,
  getActiveNotifications,
  addNotificationPostedListener,
  addNotificationRemovedListener,
  ExpoNotification
} from 'expo-notification-listener';

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [activeNotifications, setActiveNotifications] = useState<ExpoNotification[]>([]);
  const [liveLogs, setLiveLogs] = useState<{ type: string; notification: ExpoNotification; time: string }[]>([]);

  const checkPermission = () => {
    const granted = isPermissionGranted();
    setHasPermission(granted);
  };

  useEffect(() => {
    checkPermission();

    // Check again when the app returns from system settings screen
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    // Subscribe to foreground/live events
    const postedSubscription = addNotificationPostedListener((notification) => {
      setLiveLogs((prev) => [
        {
          type: 'POSTED',
          notification,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 19), // Keep last 20 logs
      ]);
    });

    const removedSubscription = addNotificationRemovedListener((notification) => {
      setLiveLogs((prev) => [
        {
          type: 'REMOVED',
          notification,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      subscription.remove();
      postedSubscription.remove();
      removedSubscription.remove();
    };
  }, []);

  const handleFetchActive = async () => {
    try {
      const list = await getActiveNotifications();
      setActiveNotifications(list);
    } catch (error) {
      console.error('Failed to fetch active notifications:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      <View style={styles.container}>
        <Text style={styles.title}>Expo Notification Listener</Text>
        <Text style={styles.subtitle}>Android-only system listener demonstration</Text>

        {/* 1. Permission status card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permission Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: hasPermission ? '#4ADE80' : '#F87171' },
              ]}
            />
            <Text style={styles.statusText}>
              {hasPermission ? 'Notification Access Granted' : 'Notification Access Denied'}
            </Text>
          </View>

          {!hasPermission && (
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant Access in Settings</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={openNotificationSettings}>
            <Text style={styles.secondaryButtonText}>Open Notification Access Settings</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Interactive action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFetchActive}>
            <Text style={styles.actionButtonText}>Fetch Active Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={checkPermission}>
            <Text style={styles.actionButtonText}>Refresh Permission</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Render items */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>
            Active Notifications ({activeNotifications.length})
          </Text>
          {activeNotifications.length === 0 ? (
            <Text style={styles.emptyText}>No active notifications found. Press Fetch.</Text>
          ) : (
            activeNotifications.map((notif) => (
              <View key={notif.key} style={styles.notificationCard}>
                <View style={styles.notifHeader}>
                  <Text style={styles.appName}>{notif.appName}</Text>
                  <Text style={styles.packageName}>{notif.packageName}</Text>
                </View>
                <Text style={styles.notifTitle}>{notif.title || '(No Title)'}</Text>
                <Text style={styles.notifText}>{notif.text || '(No Content)'}</Text>
                {notif.category && (
                  <Text style={styles.notifMeta}>Category: {notif.category}</Text>
                )}
                <View style={styles.notifFooter}>
                  <Text style={styles.notifTime}>
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.notifFlags}>
                    {notif.ongoing ? 'Ongoing' : ''} {notif.clearable ? 'Clearable' : ''}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionHeader}>Live Emitter Logs ({liveLogs.length})</Text>
          {liveLogs.length === 0 ? (
            <Text style={styles.emptyText}>Waiting for live notifications...</Text>
          ) : (
            liveLogs.map((log, index) => (
              <View key={index} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text
                    style={[
                      styles.logType,
                      { color: log.type === 'POSTED' ? '#4ADE80' : '#F87171' },
                    ]}
                  >
                    {log.type}
                  </Text>
                  <Text style={styles.logTime}>{log.time}</Text>
                </View>
                <Text style={styles.logAppName}>{log.notification.appName}</Text>
                <Text style={styles.logTitle}>{log.notification.title || '(No Title)'}</Text>
                <Text style={styles.logText} numberOfLines={2}>
                  {log.notification.text || '(No Content)'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121214',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121214',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E9F',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 15,
    color: '#E5E5EA',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#E5E5EA',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyText: {
    color: '#636366',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  notificationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0A84FF',
  },
  packageName: {
    fontSize: 11,
    color: '#8E8E9F',
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notifText: {
    fontSize: 14,
    color: '#E5E5EA',
    marginBottom: 6,
  },
  notifMeta: {
    fontSize: 11,
    color: '#636366',
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 6,
  },
  notifTime: {
    fontSize: 11,
    color: '#636366',
  },
  notifFlags: {
    fontSize: 11,
    color: '#30D158',
    fontWeight: '500',
  },
  logCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0A84FF',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logType: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTime: {
    fontSize: 11,
    color: '#636366',
  },
  logAppName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E5EA',
  },
  logTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logText: {
    fontSize: 12,
    color: '#8E8E9F',
  },
});
