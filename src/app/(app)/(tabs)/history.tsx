import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChartCard } from '@/components/Chart';
import { MealRow } from '@/components/MealRow';
import { Segmented } from '@/components/ui/Segmented';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText, Card } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useDiary } from '@/lib/diary';
import type { Meal } from '@/lib/types';
import { dayKey, sumCalories, sumMacros, todayKey } from '@/lib/types';

type Period = '7' | '30' | '90';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HistoryScreen() {
  const days = useDiary((s) => s.days);
  const goals = useDiary((s) => s.goals);
  const [period, setPeriod] = useState<Period>('7');
  const [selected, setSelected] = useState<string>(() => todayKey());

  const daysList = useMemo(() => {
    const n = Number(period);
    const out: { key: string; label: string; calories: number; goal: number; date: Date }[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayKey(d);
      const meals = days[key] ?? [];
      out.push({
        key,
        label: n === 7 ? WEEKDAY_LETTERS[d.getDay()] : n === 30 ? `${d.getDate()}` : d.toLocaleDateString(undefined, { month: 'short' }).slice(0, 3),
        calories: sumCalories(meals),
        goal: goals.calories,
        date: d,
      });
    }
    return out;
  }, [days, goals.calories, period]);

  const selectedMeals: Meal[] = days[selected] ?? [];
  const selectedCalories = sumCalories(selectedMeals);
  const selectedMacros = sumMacros(selectedMeals);

  const avg = useMemo(
    () => daysList.filter((d) => d.calories > 0).reduce((a, d) => a + d.calories, 0) / Math.max(1, daysList.filter((d) => d.calories > 0).length),
    [daysList]
  );
  const best = useMemo(() => daysList.reduce((m, d) => (d.calories > 0 && d.calories <= goals.calories && d.calories > m) ? d.calories : m, 0), [daysList, goals.calories]);
  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const meals = days[dayKey(d)] ?? [];
      if (meals.length > 0) count++;
      else break;
    }
    return count;
  }, [days]);

  const selectedDateLabel = selected === todayKey()
    ? 'Today'
    : (() => {
        const d = new Date(selected + 'T12:00:00');
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      })();

  return (
    <Screen header={<ScreenTitle title="History" subtitle="Your trends at a glance." />}>
      <Segmented
        value={period}
        onChange={(p) => {
          setPeriod(p);
          setSelected(todayKey());
        }}
        options={[
          { label: '7 days', value: '7' },
          { label: '30 days', value: '30' },
          { label: '90 days', value: '90' },
        ]}
      />

      <ChartCard
        title="Calories"
        period={`Last ${period} days`}
        height={190}
        bars={daysList.map((d) => ({
          label: d.label,
          calories: d.calories,
          goal: d.goal,
          selected: d.key === selected,
        }))}
      />

      <View style={styles.statsRow}>
        <Stat label="Avg / day" value={`${Math.round(avg)}`} icon="analytics-outline" />
        <Stat label="Best day" value={`${Math.round(best)}`} icon="trophy-outline" />
        <Stat label="Streak" value={`${streak} d`} icon="flame-outline" />
      </View>

      <Card>
        <View style={styles.dayHeader}>
          <AppText variant="md" weight={700}>{selectedDateLabel}</AppText>
          <AppText variant="md" weight={800} mono color={selectedCalories > goals.calories ? palette.fat : palette.accent}>
            {Math.round(selectedCalories)} kcal
          </AppText>
        </View>
        {selectedMeals.length === 0 ? (
          <View style={styles.emptyDay}>
            <AppText variant="sm" color={palette.textTertiary}>No meals logged this day.</AppText>
          </View>
        ) : (
          <View>
            {selectedMeals.map((meal) => (
              <MealRow key={meal.id} meal={meal} />
            ))}
            <View style={styles.dayMacros}>
              <MacroChip label="P" value={selectedMacros.protein} color={palette.protein} />
              <MacroChip label="C" value={selectedMacros.carbs} color={palette.carbs} />
              <MacroChip label="F" value={selectedMacros.fat} color={palette.fat} />
            </View>
          </View>
        )}
      </Card>

      {!daysList.some((d) => d.key === selected) ? null : null}
    </Screen>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={palette.textTertiary} />
      <AppText variant="lg" weight={800} mono>{value}</AppText>
      <AppText variant="xs" color={palette.textTertiary}>{label}</AppText>
    </View>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <AppText variant="xs" weight={700} color={color}>{label} {Math.round(value)}g</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  stat: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  emptyDay: { paddingVertical: Spacing.md },
  dayMacros: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
});
