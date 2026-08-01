import { Ionicons } from '@expo/vector-icons';
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
import { hapticSuccess } from '@/lib/haptics';
import { usePro } from '@/lib/pro';

export default function GoalsScreen() {
  const router = useRouter();
  const goals = useDiary((s) => s.goals);
  const profile = useDiary((s) => s.profile);
  const setGoals = useDiary((s) => s.setGoals);
  const pro = usePro();

  const [calories, setCalories] = useState(String(goals.calories));
  const [protein, setProtein] = useState(String(goals.protein));
  const [carbs, setCarbs] = useState(String(goals.carbs));
  const [fat, setFat] = useState(String(goals.fat));
  const [saved, setSaved] = useState(false);

  function save() {
    setGoals({
      calories: clamp(Number(calories) || goals.calories, 800, 6000),
      protein: clamp(Number(protein) || goals.protein, 0, 500),
      carbs: clamp(Number(carbs) || goals.carbs, 0, 800),
      fat: clamp(Number(fat) || goals.fat, 0, 300),
    });
    hapticSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  function applySuggestion() {
    if (!profile) return;
    const t = macroTargetsFromProfile(profile);
    setCalories(String(t.calories));
    setProtein(String(t.protein));
    setCarbs(String(t.carbs));
    setFat(String(t.fat));
  }

  return (
    <Screen header={<ScreenTitle title="Goals" subtitle="Your daily targets." />}>
      <View style={styles.grid}>
        <Field label="Calories" suffix="kcal" value={calories} onChangeText={(t) => setCalories(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Protein" suffix="g" value={protein} onChangeText={(t) => setProtein(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Carbs" suffix="g" value={carbs} onChangeText={(t) => setCarbs(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Fat" suffix="g" value={fat} onChangeText={(t) => setFat(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
      </View>

      <Button title={saved ? 'Saved' : 'Save goals'} onPress={save} fullWidth loading={false} icon={saved ? 'checkmark' : undefined} />

      {profile ? (
        <Card>
          <View style={styles.suggestRow}>
            <View style={styles.suggestText}>
              <AppText variant="md" weight={700}>Recalculate</AppText>
              <AppText variant="sm" color={palette.textSecondary}>
                Use the {macroTargetsFromProfile(profile).calories} kcal estimate from your profile.
              </AppText>
            </View>
            <Button title="Apply" variant="secondary" onPress={applySuggestion} />
          </View>
        </Card>
      ) : null}

      {!pro.isPro ? (
        <Card style={styles.proCard}>
          <Ionicons name="diamond" size={18} color={palette.accent} />
          <View style={styles.proText}>
            <AppText variant="md" weight={700}>Vitals Pro</AppText>
            <AppText variant="sm" color={palette.textSecondary}>
              Unlock unlimited AI logs, full history and widgets.
            </AppText>
          </View>
          <Button title="See plans" variant="secondary" onPress={() => router.push('/paywall')} />
        </Card>
      ) : null}
    </Screen>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  half: { width: '47%' },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  suggestText: { flex: 1, gap: 2 },
  proCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  proText: { flex: 1, gap: 1 },
});
