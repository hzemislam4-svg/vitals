import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import type { Meal } from '@/lib/types';
import { AppText } from './ui/Text';

export const MEAL_TYPE_META: Record<Meal['mealType'], { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  breakfast: { label: 'Breakfast', icon: 'sunny-outline' },
  lunch: { label: 'Lunch', icon: 'restaurant-outline' },
  dinner: { label: 'Dinner', icon: 'moon-outline' },
  snack: { label: 'Snack', icon: 'cafe-outline' },
};

export function MealRow({
  meal,
  onPress,
  onDelete,
}: {
  meal: Meal;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const meta = MEAL_TYPE_META[meal.mealType];
  const when = new Date(meal.loggedAt);
  const time = when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {meal.photoUri ? (
        <Image source={{ uri: meal.photoUri }} style={styles.thumb} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]}>
          <Ionicons name={meta.icon} size={22} color={palette.accent} />
        </View>
      )}

      <View style={styles.mid}>
        <AppText variant="md" weight={600} numberOfLines={1}>
          {meal.name}
        </AppText>
        <AppText variant="xs" color={palette.textTertiary}>
          {time} · {meal.quantity}
        </AppText>
        <View style={styles.chips}>
          <Chip label={`P ${Math.round(meal.protein)}`} color={palette.protein} />
          <Chip label={`C ${Math.round(meal.carbs)}`} color={palette.carbs} />
          <Chip label={`F ${Math.round(meal.fat)}`} color={palette.fat} />
        </View>
      </View>

      <View style={styles.right}>
        <AppText variant="lg" weight={800} mono>
          {Math.round(meal.calories)}
        </AppText>
        <AppText variant="xs" color={palette.textTertiary}>kcal</AppText>
        {onDelete ? (
          <Pressable hitSlop={10} onPress={onDelete} style={styles.delete}>
            <Ionicons name="trash-outline" size={16} color={palette.textTertiary} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}1A` }]}>
      <AppText variant="xs" weight={600} color={color}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pressed: { opacity: 0.7 },
  thumb: { width: 52, height: 52, borderRadius: Radius.md },
  thumbFallback: {
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', gap: Spacing.xs, marginTop: 3 },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.pill },
  right: { alignItems: 'flex-end', gap: 1 },
  delete: { marginTop: Spacing.xs },
});
