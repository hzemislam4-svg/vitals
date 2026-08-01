import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';
import { useDiary } from '@/lib/diary';

function useOnboarded() {
  return useDiary((s) => s.onboarded);
}

export default function AppLayout() {
  const onboarded = useOnboarded();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      {onboarded ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="onboarding" />
      )}
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
