import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { palette } from '@/constants/theme';
import { clerkKey, devSignedIn, hasClerk } from '@/lib/auth';
import { configureNotificationHandler, syncNotifications } from '@/lib/notifications';
import { initPurchases } from '@/lib/pro';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // SecureStore unavailable; session just won't persist.
    }
  },
};

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();
    syncNotifications().catch(() => {});
    initPurchases().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        {hasClerk ? (
          <ClerkProvider tokenCache={tokenCache} publishableKey={clerkKey}>
            <RootNavigator />
          </ClerkProvider>
        ) : (
          <RootNavigator />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const auth = useAuth();
  const isLoaded = devSignedIn ? true : auth.isLoaded;
  const signedIn = devSignedIn ? true : !!auth.userId;

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
      {signedIn ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
