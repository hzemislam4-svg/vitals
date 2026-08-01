import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText, Card } from '@/components/ui/Text';
import { palette, Spacing } from '@/constants/theme';
import { useDiary } from '@/lib/diary';
import { macroTargetsFromProfile } from '@/lib/goaltime';
import type { Goals } from '@/lib/types';

export default function OnboardingGoals() {
  const router = useRouter();
  const profile = useDiary((s) => s.profile);
  const base = profile ? macroTargetsFromProfile(profile) : { calories: 2000, protein: 120, carbs: 200, fat: 65 };

  const [calories, setCalories] = useState(String(base.calories));
  const [protein, setProtein] = useState(String(base.protein));
  const [carbs, setCarbs] = useState(String(base.carbs));
  const [fat, setFat] = useState(String(base.fat));

  function saveAndNext() {
    const goals: Goals = {
      calories: Math.max(800, Number(calories) || base.calories),
      protein: Math.max(0, Number(protein) || base.protein),
      carbs: Math.max(0, Number(carbs) || base.carbs),
      fat: Math.max(0, Number(fat) || base.fat),
    };
    useDiary.getState().setGoals(goals);
    router.push('/onboarding/reminders');
  }

  return (
    <Screen
      header={<ScreenTitle title="Daily goals" subtitle="You can tweak these anytime in the Goals tab." />}
      footer={
        <View style={styles.footer}>
          <Button title="Continue" fullWidth onPress={saveAndNext} />
          <Button title="Use my estimate instead" variant="ghost" onPress={saveAndNext} />
        </View>
      }
    >
      <Card style={styles.preview}>
        <AppText variant="md" weight={700}>Your calorie target</AppText>
        <AppText variant="display" weight={800} color={palette.accent} mono>
          {Number(calories) || base.calories}
        </AppText>
        <AppText variant="sm" color={palette.textSecondary}>kcal per day · estimated from your profile</AppText>
      </Card>

      <View style={styles.grid}>
        <Field label="Calories" suffix="kcal" value={calories} onChangeText={(t) => setCalories(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Protein" suffix="g" value={protein} onChangeText={(t) => setProtein(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Carbs" suffix="g" value={carbs} onChangeText={(t) => setCarbs(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Fat" suffix="g" value={fat} onChangeText={(t) => setFat(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', gap: 4, paddingVertical: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  half: { width: '47%' },
  footer: { gap: Spacing.xs },
});
