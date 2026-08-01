import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Text';
import { palette } from '@/constants/theme';

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    if (!signIn) return;
    setError(null);
    const { error: err } = await signIn.password({ emailAddress: email.trim(), password });
    if (err) {
      setError(err.longMessage ?? err.message ?? 'Invalid email or password.');
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize();
    } else {
      setError('Sign-in is not complete yet. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <View style={styles.spacer} />
        <ScreenTitle title="Welcome back" subtitle="Sign in to keep your streak going." />
        <View style={styles.form}>
          <Field
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? (
            <AppText variant="sm" color={palette.danger}>{error}</AppText>
          ) : null}
          <Button title="Sign in" onPress={onSignIn} loading={fetchStatus === 'fetching'} fullWidth />
          <View style={styles.switchRow}>
            <AppText variant="md" color={palette.textSecondary}>New here?</AppText>
            <Button title="Create an account" variant="ghost" onPress={() => router.push('/sign-up')} />
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  spacer: { height: 40 },
  form: { gap: 20, marginTop: 24 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
