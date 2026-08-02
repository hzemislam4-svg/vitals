import { useMemo } from 'react';

import { useDiary } from '@/lib/diary';
import { sumCalories, sumMacros, todayKey } from '@/lib/types';

export function useToday() {
  const goals = useDiary((s) => s.goals);
  const days = useDiary((s) => s.days);

  const meals = useMemo(() => days[todayKey()] ?? [], [days]);
  const macros = useMemo(() => sumMacros(meals), [meals]);
  const calories = useMemo(() => sumCalories(meals), [meals]);
  const remaining = goals.calories - calories;
  const percent = goals.calories > 0 ? Math.min(1, Math.max(0, calories / goals.calories)) : 0;

  return { meals, macros, calories, remaining, percent, goals };
}
