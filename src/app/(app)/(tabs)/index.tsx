import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { LegendRow } from '@/components/Chart';
import { MEAL_TYPE_META, MealRow } from '@/components/MealRow';
import { Button } from '@/components/ui/Button';
import { MacroBreakdown } from '@/components/ui/Macros';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Screen } from '@/components/ui/Screen';
import { AppText, Card } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useDiary } from '@/lib/diary';
import { isIOS } from '@/lib/goaltime';
import { useTodaySteps } from '@/lib/health';
import { usePro } from '@/lib/pro';
import type { Meal, MealType } from '@/lib/types';
import { todayKey } from '@/lib/types';
import { useToday } from '@/hooks/useToday';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function TodayScreen() {
  const router = useRouter();
  const { meals, macros, calories, remaining, percent, goals } = useToday();
  const pro = usePro();
  const removeMeal = useDiary((s) => s.removeMeal);
  const steps = useTodaySteps();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  function confirmDelete(meal: Meal) {
    Alert.alert('Remove meal', `Delete "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeMeal(todayKey(), meal.id) },
    ]);
  }

  return (
    <Screen header={<Header today={today} isPro={pro.isPro} />}>
      <Card style={styles.ringCard}>
        <ProgressRing size={208} strokeWidth={16} progress={percent}>
          <View style={styles.ringCenter}>
            <AppText variant="display" weight={800} mono>{Math.round(calories)}</AppText>
            <AppText variant="sm" color={palette.textSecondary}>of {goals.calories} kcal</AppText>
          </View>
        </ProgressRing>
        <View style={styles.ringFooter}>
          <View style={[styles.remainingPill, { backgroundColor: remaining >= 0 ? palette.accentSoft : palette.fatSoft }]}>
            <Ionicons
              name={remaining >= 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={16}
              color={remaining >= 0 ? palette.accent : palette.fat}
            />
            <AppText variant="sm" weight={700} color={remaining >= 0 ? palette.accent : palette.fat}>
              {remaining >= 0 ? `${Math.round(remaining)} kcal left` : `${Math.abs(Math.round(remaining))} kcal over`}
            </AppText>
          </View>
          <LegendRow />
        </View>
      </Card>

      <Card style={styles.macroCard}>
        <AppText variant="md" weight={700} style={styles.macroTitle}>Macros</AppText>
        <MacroBreakdown
          protein={macros.protein}
          carbs={macros.carbs}
          fat={macros.fat}
          proteinGoal={goals.protein}
          carbsGoal={goals.carbs}
          fatGoal={goals.fat}
        />
      </Card>

      {isIOS ? (
        <Card style={styles.stepsCard}>
          <Ionicons name="walk" size={20} color={palette.protein} />
          <View style={styles.stepsText}>
            <AppText variant="md" weight={700}>{Math.round(steps).toLocaleString()} steps</AppText>
            <AppText variant="xs" color={palette.textTertiary}>from Apple Health</AppText>
          </View>
          <AppText variant="xs" color={palette.textTertiary}>{steps > 0 ? 'Synced' : 'Not available'}</AppText>
        </Card>
      ) : null}

      {!pro.isPro ? (
        <Card style={styles.freeCard}>
          <Ionicons name="infinite" size={16} color={palette.accent} />
          <AppText variant="sm" color={palette.textSecondary} style={styles.freeText}>
            Free plan: <AppText variant="sm" weight={700} color={palette.text}>3 AI logs used</AppText> ·{' '}
            <AppText variant="sm" color={palette.accent} onPress={() => router.push('/paywall')}>Upgrade</AppText>
          </AppText>
        </Card>
      ) : null}

      <View style={styles.mealsHeader}>
        <AppText variant="lg" weight={700}>Today’s meals</AppText>
        <AppText variant="sm" color={palette.textTertiary}>{meals.length} logged</AppText>
      </View>

      {meals.length === 0 ? (
        <EmptyMeals />
      ) : (
        MEAL_ORDER.map((type) => {
          const group = meals.filter((m) => m.mealType === type);
          if (group.length === 0) return null;
          const meta = MEAL_TYPE_META[type];
          return (
            <Card key={type} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Ionicons name={meta.icon} size={16} color={palette.accent} />
                <AppText variant="sm" weight={700} color={palette.textSecondary}>{meta.label}</AppText>
              </View>
              {group.map((meal) => (
                <MealRow
                  key={meal.id}
                  meal={meal}
                  onPress={() => router.push({ pathname: '/capture/review', params: { edit: meal.id } })}
                  onDelete={() => confirmDelete(meal)}
                />
              ))}
            </Card>
          );
        })
      )}

      <View style={styles.addActions}>
        <Button title="Log a meal" icon="camera" fullWidth onPress={() => router.push('/capture')} />
        <Button title="Manual entry" variant="secondary" icon="create" fullWidth onPress={() => router.push('/capture/review')} />
      </View>
    </Screen>
  );
}

function Header({ today, isPro }: { today: string; isPro: boolean }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <View style={styles.header}>
      <View>
        <AppText variant="xl" weight={800}>{greeting}</AppText>
        <AppText variant="sm" color={palette.textTertiary}>{today}</AppText>
      </View>
      {isPro ? (
        <Pressable onPress={() => {}}>
          <View style={styles.proPill}>
            <Ionicons name="diamond" size={12} color={palette.accent} />
            <AppText variant="xs" weight={700} color={palette.accent}>PRO</AppText>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyMeals() {
  return (
    <Card style={styles.empty}>
      <Ionicons name="restaurant-outline" size={28} color={palette.textTertiary} />
      <AppText variant="md" color={palette.textSecondary} align="center">
        Nothing logged yet. Tap “Log a meal” to snap your first photo.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accentBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  ringCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  ringCenter: { alignItems: 'center' },
  ringFooter: { alignItems: 'center', gap: Spacing.sm },
  remainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  macroCard: { gap: Spacing.lg },
  macroTitle: { marginBottom: -Spacing.sm },
  stepsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  stepsText: { flex: 1, gap: 1 },
  freeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: palette.bgElevated,
  },
  freeText: { flex: 1 },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  mealCard: { gap: Spacing.xs },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  addActions: { gap: Spacing.md },
  empty: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
});

