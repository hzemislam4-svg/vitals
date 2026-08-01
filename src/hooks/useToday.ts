import { useEffect, useMemo } from 'react';

import { useDiary } from '@/lib/diary';
import { endCalorieActivity, startCalorieActivity, syncCalorieWidget, updateCalorieActivity } from '@/lib/liveActivity';
import { sumCalories, sumMacros, todayKey } from '@/lib/types';
import type { LiveActivity } from 'expo-widgets';
import type { CalorieActivityProps } from '@/widgets/CalorieActivity';

let activity: LiveActivity<CalorieActivityProps> | null = null;

export function useToday() {
  const goals = useDiary((s) => s.goals);
  const days = useDiary((s) => s.days);
  const flags = useDiary((s) => s.flags);

  const meals = useMemo(() => days[todayKey()] ?? [], [days]);
  const macros = useMemo(() => sumMacros(meals), [meals]);
  const calories = useMemo(() => sumCalories(meals), [meals]);
  const remaining = goals.calories - calories;
  const percent = goals.calories > 0 ? Math.min(1, Math.max(0, calories / goals.calories)) : 0;

  useEffect(() => {
    const props = {
      calories,
      goal: goals.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
    };
    syncCalorieWidget(props);

    if (!flags.liveActivityEnabled) {
      if (activity) {
        endCalorieActivity(activity);
        activity = null;
      }
      return;
    }

    const activityProps: CalorieActivityProps = { ...props, remaining };
    if (activity) {
      updateCalorieActivity(activity, activityProps);
    } else {
      activity = startCalorieActivity(activityProps);
    }
  }, [calories, macros, goals, flags.liveActivityEnabled, remaining]);

  return { meals, macros, calories, remaining, percent, goals };
}

export function endLiveActivityForDay() {
  if (activity) {
    endCalorieActivity(activity);
    activity = null;
  }
}
