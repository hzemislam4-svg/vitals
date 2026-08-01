import React from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import { AppText } from './Text';

type MacroColor = 'protein' | 'carbs' | 'fat';

const MACROS: { key: MacroColor; label: string; color: string; soft: string }[] = [
  { key: 'protein', label: 'Protein', color: palette.protein, soft: palette.proteinSoft },
  { key: 'carbs', label: 'Carbs', color: palette.carbs, soft: palette.carbsSoft },
  { key: 'fat', label: 'Fat', color: palette.fat, soft: palette.fatSoft },
];

export function MacroBar({
  current,
  goal,
  color,
}: {
  current: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min(1, current / goal) : 0;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { backgroundColor: color, width: `${pct * 100}%` }]} />
    </View>
  );
}

export function MacroRow({ label, color, current, goal }: { label: string; color: string; current: number; goal: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.labelWrap}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <AppText variant="md" weight={500}>{label}</AppText>
        </View>
        <AppText variant="md" weight={600} mono>
          <AppText variant="md" weight={800} color={palette.text}>{Math.round(current)}</AppText>
          <AppText variant="md" weight={500} color={palette.textTertiary}> / {Math.round(goal)} g</AppText>
        </AppText>
      </View>
      <MacroBar current={current} goal={goal} color={color} />
    </View>
  );
}

export function MacroBreakdown({
  protein,
  carbs,
  fat,
  proteinGoal,
  carbsGoal,
  fatGoal,
}: {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}) {
  return (
    <View style={styles.wrap}>
      {MACROS.map((m) => {
        const current = m.key === 'protein' ? protein : m.key === 'carbs' ? carbs : fat;
        const goal = m.key === 'protein' ? proteinGoal : m.key === 'carbs' ? carbsGoal : fatGoal;
        return <MacroRow key={m.key} label={m.label} color={m.color} current={current} goal={goal} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  row: { gap: Spacing.sm },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: palette.borderSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
