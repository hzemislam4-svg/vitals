import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function CaptureLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="review" options={{ presentation: 'card' }} />
    </Stack>
  );
}
