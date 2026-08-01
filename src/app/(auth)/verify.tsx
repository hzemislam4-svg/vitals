import { useSignUp } from '@clerk/expo';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Text';
import { palette } from '@/constants/theme';

export default function VerifyScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onVerify() {
    if (!signUp) return;
    setError(null);
    const { error: err } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (err) {
      setError(err.longMessage ?? err.message ?? 'That code did not work. Please try again.');
      return;
    }
    if (signUp.status === 'complete') {
      await signUp.finalize();
    } else {
      setError('Verification is not complete yet.');
    }
  }

  async function onResend() {
    if (!signUp) return;
    const { error: err } = await signUp.verifications.sendEmailCode();
    setError(err ? 'Could not resend the code.' : 'A new code was sent.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <View style={styles.spacer} />
        <ScreenTitle
          title="Check your email"
          subtitle={`We sent a 6-digit code to ${params.email ?? 'your inbox'}.`}
        />
        <View style={styles.form}>
          <Field
            label="Verification code"
            placeholder="000000"
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            autoFocus
          />
          {error ? (
            <AppText variant="sm" color={palette.danger}>{error}</AppText>
          ) : null}
          <Button title="Verify & continue" onPress={onVerify} loading={fetchStatus === 'fetching'} fullWidth />
          <View style={styles.resendRow}>
            <AppText variant="sm" color={palette.textTertiary}>Didn’t get it?</AppText>
            <Button title="Resend code" variant="ghost" onPress={onResend} />
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
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
