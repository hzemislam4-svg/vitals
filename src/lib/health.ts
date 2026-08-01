import AppleHealth, { HealthKitQuery } from 'apple-health';
import { useHealthKitStatistics } from 'apple-health/hooks';

import { isIOS } from './goaltime';

export async function requestHealthPermission(): Promise<boolean> {
  if (!isIOS) return false;
  try {
    const res = await AppleHealth.requestAuthorization({ read: ['stepCount'], write: [] });
    return res?.status === 'sharingAuthorized';
  } catch (e) {
    console.warn('health permission failed', e);
    return false;
  }
}

/** Live steps for today, updated as HealthKit changes. */
export function useTodaySteps(): number {
  if (!isIOS) return 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data } = useHealthKitStatistics({
    type: 'stepCount',
    aggregations: ['cumulativeSum'],
    startDate: startOfDay(new Date()),
    endDate: new Date(),
  });
  const value = Array.isArray(data) ? data[0] : data;
  return value?.sumQuantity ?? 0;
}

export async function getTodaySteps(): Promise<number> {
  if (!isIOS) return 0;
  try {
    const stats = await new HealthKitQuery()
      .type('stepCount', 'quantity')
      .dateRange(startOfDay(new Date()), new Date())
      .aggregations(['cumulativeSum'])
      .executeStatistics();
    return Array.isArray(stats) ? stats[0]?.sumQuantity ?? 0 : stats?.sumQuantity ?? 0;
  } catch (e) {
    console.warn('steps query failed', e);
    return 0;
  }
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
