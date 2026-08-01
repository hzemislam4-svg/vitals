import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { AppText, Card } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useDraft, useDiary } from '@/lib/diary';
import { hapticSuccess } from '@/lib/haptics';
import { usePro } from '@/lib/pro';
import type { Meal, MealType } from '@/lib/types';
import { dayKey, todayKey } from '@/lib/types';

type DraftItem = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ edit?: string }>();
  const draft = useDraft();
  const addMeal = useDiary((s) => s.addMeal);
  const updateMeal = useDiary((s) => s.updateMeal);
  const days = useDiary((s) => s.days);
  const pro = usePro();
  const bumpFreeLog = useDiary((s) => s.bumpFreeLog);

  const editing = params.edit;
  const editingMeal: Meal | null = useMemo(() => {
    if (!editing) return null;
    const key = todayKey();
    return (days[key] ?? []).find((m) => m.id === editing) ?? null;
  }, [editing, days]);

  const [mealType, setMealType] = useState<MealType>(editingMeal?.mealType ?? 'lunch');
  const [items, setItems] = useState<DraftItem[]>(() => {
    if (editingMeal) {
      return [
        {
          name: editingMeal.name,
          quantity: editingMeal.quantity,
          calories: editingMeal.calories,
          protein: editingMeal.protein,
          carbs: editingMeal.carbs,
          fat: editingMeal.fat,
        },
      ];
    }
    if (draft.items.length > 0) return draft.items.map((it) => ({ ...it }));
    return [{ name: '', quantity: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 }];
  });

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, it) => ({
          calories: acc.calories + (it.calories || 0),
          protein: acc.protein + (it.protein || 0),
          carbs: acc.carbs + (it.carbs || 0),
          fat: acc.fat + (it.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [items]
  );

  const hasPhoto = !editingMeal && !!draft.photoUri;

  function patchItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function save() {
    const clean = items
      .map((it) => ({
        ...it,
        name: it.name.trim() || 'Meal',
        quantity: it.quantity.trim() || '1 serving',
      }))
      .filter((it) => it.calories > 0 || it.name !== 'Meal');

    if (clean.length === 0) {
      alert('Add at least one food with calories to save.');
      return;
    }

    const now = new Date();

    if (editingMeal) {
      const merged = clean.reduce(
        (acc, it) => ({
          calories: acc.calories + it.calories,
          protein: acc.protein + it.protein,
          carbs: acc.carbs + it.carbs,
          fat: acc.fat + it.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      updateMeal(todayKey(), editingMeal.id, {
        name: clean.length === 1 ? clean[0].name : `${clean.length} items`,
        quantity: clean.length === 1 ? clean[0].quantity : `${clean.length} foods`,
        ...merged,
        mealType,
      });
      hapticSuccess();
      router.back();
      return;
    }

    const baseTs = Date.now();
    clean.forEach((it, idx) => {
      const meal: Meal = {
        id: `${now.getTime()}-${idx}`,
        name: it.name,
        quantity: it.quantity,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        mealType,
        loggedAt: new Date(baseTs + idx).toISOString(),
        photoUri: idx === 0 && hasPhoto ? draft.photoUri : null,
        source: draft.source === 'demo' ? 'demo' : 'camera',
      };
      addMeal(meal, dayKey(new Date(baseTs + idx)));
    });

    if (draft.source === 'ai' && !pro.isPro) {
      bumpFreeLog();
    }

    hapticSuccess();
    useDraft.getState().clear();
    router.replace('/');
  }

  return (
    <Screen
      header={
        <View style={styles.header}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              draft.clear();
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={26} color={palette.text} />
          </Pressable>
          <AppText variant="md" weight={700}>{editing ? 'Edit meal' : 'Review estimate'}</AppText>
          <View style={styles.headerSpacer} />
        </View>
      }
      footer={
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Card style={styles.totalCard}>
            <View style={styles.totalMain}>
              <AppText variant="md" weight={600} color={palette.textSecondary}>Total</AppText>
              <AppText variant="2xl" weight={800} mono>{Math.round(totals.calories)} kcal</AppText>
            </View>
            <AppText variant="sm" color={palette.textTertiary} mono>
              P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
            </AppText>
          </Card>
          <Button title={editing ? 'Save changes' : 'Add to diary'} fullWidth onPress={save} />
        </View>
      }
    >
      {hasPhoto ? (
        <Image source={{ uri: draft.photoUri! }} style={styles.photo} contentFit="cover" transition={200} />
      ) : editingMeal?.photoUri ? (
        <Image source={{ uri: editingMeal.photoUri }} style={styles.photo} contentFit="cover" transition={200} />
      ) : null}

      <Card style={styles.typeCard}>
        <AppText variant="xs" weight={600} color={palette.textTertiary}>Meal type</AppText>
        <Segmented
          value={mealType}
          onChange={setMealType}
          options={[
            { label: 'Breakfast', value: 'breakfast' },
            { label: 'Lunch', value: 'lunch' },
            { label: 'Dinner', value: 'dinner' },
            { label: 'Snack', value: 'snack' },
          ]}
        />
      </Card>

      {items.map((it, index) => (
        <Card key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <AppText variant="sm" weight={700} color={palette.textSecondary}>
              Food {items.length > 1 ? index + 1 : ''}
            </AppText>
            {items.length > 1 ? (
              <Pressable hitSlop={10} onPress={() => setItems((prev) => prev.filter((_, i) => i !== index))}>
                <Ionicons name="trash-outline" size={18} color={palette.danger} />
              </Pressable>
            ) : null}
          </View>
          <Field
            label="Name"
            placeholder="e.g. Grilled chicken"
            value={it.name}
            onChangeText={(t) => patchItem(index, { name: t })}
          />
          <Field
            label="Portion"
            placeholder="e.g. 1 plate · 380 g"
            value={it.quantity}
            onChangeText={(t) => patchItem(index, { quantity: t })}
          />
          <Field
            label="Calories"
            suffix="kcal"
            value={String(it.calories)}
            onChangeText={(t) => patchItem(index, { calories: Number(t.replace(/[^0-9]/g, '')) || 0 })}
            keyboardType="number-pad"
          />
          <View style={styles.macroGrid}>
            <Field label="Protein" suffix="g" value={String(it.protein)} onChangeText={(t) => patchItem(index, { protein: Number(t.replace(/[^0-9]/g, '')) || 0 })} keyboardType="number-pad" containerStyle={styles.macroField} />
            <Field label="Carbs" suffix="g" value={String(it.carbs)} onChangeText={(t) => patchItem(index, { carbs: Number(t.replace(/[^0-9]/g, '')) || 0 })} keyboardType="number-pad" containerStyle={styles.macroField} />
            <Field label="Fat" suffix="g" value={String(it.fat)} onChangeText={(t) => patchItem(index, { fat: Number(t.replace(/[^0-9]/g, '')) || 0 })} keyboardType="number-pad" containerStyle={styles.macroField} />
          </View>
        </Card>
      ))}

      <Button
        title="Add another food"
        variant="secondary"
        icon="add"
        fullWidth
        onPress={() => setItems((prev) => [...prev, { name: '', quantity: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 }])}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  headerSpacer: { width: 26 },
  photo: { width: '100%', height: 220, borderRadius: Radius.lg, borderWidth: 1, borderColor: palette.border },
  typeCard: { gap: Spacing.sm },
  itemCard: { gap: Spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  macroGrid: { flexDirection: 'row', gap: Spacing.sm },
  macroField: { flex: 1 },
  footer: { gap: Spacing.md },
  totalCard: { gap: 2 },
  totalMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
