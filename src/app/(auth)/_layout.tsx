import { Stack } from 'expo-router';

import { palette } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
