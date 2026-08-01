import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen, ScreenTitle } from '@/components/ui/Screen';
import { AppText, Card } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { palette, Spacing } from '@/constants/theme';
import { useDiary } from '@/lib/diary';
import { isIOS } from '@/lib/goaltime';
import { requestHealthPermission } from '@/lib/health';
import { syncNotifications } from '@/lib/notifications';

function SettingRow({
  title,
  body,
  value,
  onToggle,
  icon,
}: {
  title: string;
  body: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  icon: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <AppText variant="md" weight={700}>{title}</AppText>
        <AppText variant="sm" color={palette.textSecondary}>{body}</AppText>
      </View>
      <Toggle value={value} onValueChange={onToggle} />
    </View>
  );
}

export default function OnboardingReminders() {
  const router = useRouter();
  const setFlag = useDiary((s) => s.setFlag);
  const flags = useDiary((s) => s.flags);
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    await syncNotifications().catch(() => {});
    useDiary.getState().completeOnboarding();
    router.replace('/');
    setBusy(false);
  }

  async function toggleHealth(v: boolean) {
    setFlag('healthEnabled', v);
    if (v) await requestHealthPermission().catch(() => {});
  }

  return (
    <Screen
      header={
        <ScreenTitle
          title="Make it automatic"
          subtitle="Optional extras that keep your ring updated."
        />
      }
      footer={
        <View style={styles.footer}>
          <Button title="Start tracking" fullWidth loading={busy} onPress={finish} />
          <AppText variant="xs" color={palette.textTertiary} align="center">
            You can change these later in Profile.
          </AppText>
        </View>
      }
    >
      <Card style={styles.card}>
        <SettingRow
          title="Daily reminder"
          body="A gentle nudge at 8 PM to log today's meals."
          value={flags.notificationsEnabled}
          onToggle={(v) => {
            setFlag('notificationsEnabled', v);
            syncNotifications().catch(() => {});
          }}
          icon="notifications-outline"
        />
      </Card>

      {isIOS ? (
        <Card style={styles.card}>
          <SettingRow
            title="Apple Health steps"
            body="Show today's steps alongside your calories."
            value={flags.healthEnabled}
            onToggle={toggleHealth}
            icon="walk-outline"
          />
          <View style={styles.divider} />
          <SettingRow
            title="Lock Screen widget"
            body="Your calorie ring on the home screen and Live Activity."
            value={flags.liveActivityEnabled}
            onToggle={(v) => setFlag('liveActivityEnabled', v)}
            icon="time-outline"
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowText: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: palette.border },
  footer: { gap: Spacing.md },
});
