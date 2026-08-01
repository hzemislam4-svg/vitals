import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}
