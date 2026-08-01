import { Platform } from 'react-native';
import { LiveActivity } from 'expo-widgets';

import CalorieActivity, { type CalorieActivityProps } from '@/widgets/CalorieActivity';
import CalorieWidget, { type CalorieWidgetProps } from '@/widgets/CalorieWidget';

const IS_IOS = Platform.OS === 'ios';

export function syncCalorieWidget(props: CalorieWidgetProps) {
  if (!IS_IOS) return;
  try {
    CalorieWidget.updateSnapshot(props);
  } catch (e) {
    console.warn('widget sync failed', e);
  }
}

export function startCalorieActivity(props: CalorieActivityProps): LiveActivity<CalorieActivityProps> | null {
  if (!IS_IOS) return null;
  try {
    return CalorieActivity.start(props, 'vitals://today');
  } catch (e) {
    console.warn('start live activity failed', e);
    return null;
  }
}

export function updateCalorieActivity(
  instance: LiveActivity<CalorieActivityProps> | null,
  props: CalorieActivityProps,
) {
  if (!IS_IOS || !instance) return;
  try {
    instance.update(props);
  } catch (e) {
    console.warn('update live activity failed', e);
  }
}

export function endCalorieActivity(instance: LiveActivity<CalorieActivityProps> | null) {
  if (!IS_IOS || !instance) return;
  try {
    instance.end('default').catch(() => {});
  } catch (e) {
    console.warn('end live activity failed', e);
  }
}
