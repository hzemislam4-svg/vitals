import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Text';
import { palette } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSignUp() {
    if (!signUp) return;
    setError(null);
    const { error: err } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName: firstName.trim() || undefined,
    });
    if (err) {
      setError(err.longMessage ?? err.message ?? 'Could not create your account.');
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setError(sendError.longMessage ?? sendError.message ?? 'Could not send the verification code.');
      return;
    }
    router.push({ pathname: '/verify', params: { email: email.trim() } });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <View style={styles.spacer} />
        <ScreenTitle title="Create account" subtitle="Start tracking smarter, not harder." />
        <View style={styles.form}>
          <Field label="First name (optional)" placeholder="Alex" value={firstName} onChangeText={setFirstName} />
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
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? (
            <AppText variant="sm" color={palette.danger}>{error}</AppText>
          ) : null}
          <Button title="Continue" onPress={onSignUp} loading={fetchStatus === 'fetching'} fullWidth />
          <View style={styles.switchRow}>
            <AppText variant="md" color={palette.textSecondary}>Already have an account?</AppText>
            <Button title="Sign in" variant="ghost" onPress={() => router.replace('/sign-in')} />
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
