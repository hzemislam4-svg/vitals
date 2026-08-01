import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { AppText, Card } from '@/components/ui/Text';
import { palette, Spacing } from '@/constants/theme';
import { useDiary } from '@/lib/diary';
import { ACTIVITY_DESCRIPTIONS, ACTIVITY_LABELS, macroTargetsFromProfile, SEX_LABELS } from '@/lib/goaltime';
import type { Profile } from '@/lib/types';

export default function OnboardingProfile() {
  const router = useRouter();
  const setProfile = useDiary((s) => s.setProfile);

  const [age, setAge] = useState('28');
  const [sex, setSex] = useState<Profile['sex']>('female');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('168');
  const [activity, setActivity] = useState<Profile['activity']>('moderate');
  const [error, setError] = useState<string | null>(null);

  const profile: Profile | null =
    [age, weight, height].every((v) => v.trim() !== '' && Number(v) > 0)
      ? { age: Number(age), sex, weightKg: Number(weight), heightCm: Number(height), activity }
      : null;

  const suggested = profile ? macroTargetsFromProfile(profile) : null;

  function onContinue() {
    if (!profile) {
      setError('Please fill in your age, weight and height.');
      return;
    }
    if (profile.age < 13 || profile.age > 100) {
      setError('Age should be between 13 and 100.');
      return;
    }
    if (profile.weightKg < 30 || profile.weightKg > 300) {
      setError('Weight should be between 30 and 300 kg.');
      return;
    }
    if (profile.heightCm < 100 || profile.heightCm > 250) {
      setError('Height should be between 100 and 250 cm.');
      return;
    }
    setProfile(profile);
    router.push('/onboarding/goals');
  }

  return (
    <Screen header={<ScreenTitle title="Your details" subtitle="We use this to estimate your calorie targets." />}>
      <View style={styles.grid}>
        <Field label="Age" prefix="yr" value={age} onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
        <Field label="Sex" suffix={SEX_LABELS[sex]} editable={false} containerStyle={styles.half} />
      </View>

      <Segmented
        value={sex}
        onChange={setSex}
        options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ]}
      />

      <View style={styles.grid}>
        <Field label="Weight" prefix="kg" value={weight} onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" containerStyle={styles.half} />
        <Field label="Height" prefix="cm" value={height} onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ''))} keyboardType="number-pad" containerStyle={styles.half} />
      </View>

      <View style={styles.activityWrap}>
        <AppText variant="xs" weight={600} color={palette.textTertiary} style={styles.activityLabel}>Activity level</AppText>
        <Segmented
          value={activity}
          onChange={setActivity}
          options={(['sedentary', 'light', 'moderate', 'active'] as Profile['activity'][]).map((a) => ({
            label: ACTIVITY_LABELS[a],
            value: a,
          }))}
        />
        <AppText variant="sm" color={palette.textTertiary} style={styles.activityLabel}>
          {ACTIVITY_DESCRIPTIONS[activity]}
        </AppText>
      </View>

      {suggested ? (
        <Card>
          <AppText variant="md" weight={700}>Estimated target</AppText>
          <AppText variant="lg" weight={800} color={palette.accent} mono>
            {suggested.calories} kcal/day
          </AppText>
          <AppText variant="sm" color={palette.textSecondary}>
            P {suggested.protein}g · C {suggested.carbs}g · F {suggested.fat}g
          </AppText>
        </Card>
      ) : null}

      {error ? <AppText variant="sm" color={palette.danger}>{error}</AppText> : null}

      <Button title="Continue" fullWidth onPress={onContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  activityWrap: { gap: Spacing.sm },
  activityLabel: { marginLeft: 2 },
});
