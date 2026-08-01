import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useDiary } from './diary';

const REMINDER_ID = 'vitals-daily-reminder';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  const granted =
    current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (granted) return true;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return (
    req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/** Expo push token (null when projectId is not configured). */
export async function getPushToken(): Promise<string | null> {
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const granted = await ensureNotificationPermission();
    if (!granted) return null;
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.warn('push token unavailable', e);
    return null;
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'How is today going?',
      body: 'Log your meals to keep your calorie ring on track.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'default' : undefined,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}

/** Syncs the persisted reminder toggle to the OS schedule. */
export async function syncNotifications() {
  const flags = useDiary.getState().flags;
  if (!flags.notificationsEnabled) {
    await cancelDailyReminder();
    return;
  }
  const ok = await ensureNotificationPermission();
  if (ok) await scheduleDailyReminder(20, 0);
}
