import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText, Card } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { palette, Radius, Spacing } from '@/constants/theme';
import { hasClerk } from '@/lib/auth';
import { useDiary } from '@/lib/diary';
import { isIOS } from '@/lib/goaltime';
import { requestHealthPermission } from '@/lib/health';
import { syncNotifications } from '@/lib/notifications';
import { usePro } from '@/lib/pro';

export default function ProfileScreen() {
  return (
    <Screen header={<ScreenTitle title="Profile" subtitle="Account, settings and data." />}>
      {hasClerk ? <ClerkAccountCard /> : <DevAccountCard />}
      <ProCard />
      <SettingsCard />
      <DataCard />
      {hasClerk ? <SignOutButton /> : null}
      <AppText variant="xs" color={palette.textTertiary} align="center">
        Vitals 1.0.0
      </AppText>
    </Screen>
  );
}

function ClerkAccountCard() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Vitals user';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  return (
    <Card style={styles.accountRow}>
      <View style={styles.avatar}>
        <AppText variant="lg" weight={800} color={palette.accent}>
          {(name[0] ?? 'V').toUpperCase()}
        </AppText>
      </View>
      <View style={styles.accountText}>
        <AppText variant="md" weight={700} numberOfLines={1}>{name}</AppText>
        <AppText variant="sm" color={palette.textTertiary} numberOfLines={1}>{email}</AppText>
      </View>
    </Card>
  );
}

function DevAccountCard() {
  return (
    <Card style={styles.devCard}>
      <Ionicons name="flask" size={18} color={palette.carbs} />
      <AppText variant="sm" color={palette.textSecondary} style={styles.devText}>
        Development build — sign-in is disabled until a Clerk publishable key is added to <AppText variant="sm" weight={700} color={palette.text}>EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY</AppText>.
      </AppText>
    </Card>
  );
}

function ProCard() {
  const pro = usePro();
  const router = useRouter();
  return (
    <Card style={styles.accountRow}>
      <View style={[styles.avatar, { borderColor: palette.accentBorder, backgroundColor: palette.accentSoft }]}>
        <Ionicons name="diamond" size={18} color={palette.accent} />
      </View>
      <View style={styles.accountText}>
        <AppText variant="md" weight={700}>{pro.isPro ? 'Vitals Pro' : 'Free plan'}</AppText>
        <AppText variant="sm" color={palette.textTertiary}>
          {pro.isPro ? 'Subscription active' : '3 AI logs per day'}
        </AppText>
      </View>
      {!pro.isPro ? (
        <Button title="Upgrade" variant="secondary" onPress={() => router.push('/paywall')} />
      ) : null}
    </Card>
  );
}

function SettingsCard() {
  const flags = useDiary((s) => s.flags);
  const setFlag = useDiary((s) => s.setFlag);

  return (
    <Card style={styles.settings}>
      <SettingRow
        title="Daily reminder"
        body="Log reminder at 8 PM"
        value={flags.notificationsEnabled}
        onToggle={(v) => {
          setFlag('notificationsEnabled', v);
          syncNotifications().catch(() => {});
        }}
      />
      {isIOS ? (
        <>
          <Divider />
          <SettingRow
            title="Apple Health"
            body="Show steps on Today"
            value={flags.healthEnabled}
            onToggle={async (v) => {
              setFlag('healthEnabled', v);
              if (v) await requestHealthPermission().catch(() => {});
            }}
          />
          <Divider />
          <SettingRow
            title="Live Activity & widget"
            body="Calorie ring on Lock Screen"
            value={flags.liveActivityEnabled}
            onToggle={(v) => setFlag('liveActivityEnabled', v)}
          />
        </>
      ) : null}
    </Card>
  );
}

function SettingRow({ title, body, value, onToggle }: { title: string; body: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <AppText variant="md" weight={600}>{title}</AppText>
        <AppText variant="sm" color={palette.textTertiary}>{body}</AppText>
      </View>
      <Toggle value={value} onValueChange={onToggle} />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function DataCard() {
  const seed = useDiary((s) => s.seed);
  const resetAll = useDiary((s) => s.resetAll);

  function confirmReset() {
    Alert.alert('Reset all data', 'This clears your goals, profile and all logged meals. Onboarding restarts.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);
  }

  return (
    <Card style={styles.settings}>
      <Pressable style={styles.settingRow} onPress={() => seed()}>
        <View style={styles.settingText}>
          <AppText variant="md" weight={600}>Reseed demo data</AppText>
          <AppText variant="sm" color={palette.textTertiary}>Rebuild 14 days of sample history</AppText>
        </View>
        <Ionicons name="refresh" size={18} color={palette.textSecondary} />
      </Pressable>
      <Divider />
      <Pressable style={styles.settingRow} onPress={confirmReset}>
        <View style={styles.settingText}>
          <AppText variant="md" weight={600} color={palette.danger}>Reset everything</AppText>
          <AppText variant="sm" color={palette.textTertiary}>Start fresh from onboarding</AppText>
        </View>
        <Ionicons name="trash-outline" size={18} color={palette.danger} />
      </Pressable>
    </Card>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Button
      title="Sign out"
      variant="ghost"
      fullWidth
      onPress={() => {
        signOut();
      }}
    />
  );
}

const styles = StyleSheet.create({
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: palette.bgElevated,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: { flex: 1, gap: 1 },
  devCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  devText: { flex: 1 },
  settings: { gap: Spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  settingText: { flex: 1, gap: 1 },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: Spacing.xs },
});
