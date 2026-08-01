import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { formattedIntro, productPrice, usePro } from '@/lib/pro';

const PERKS = [
  { icon: 'camera-outline', title: 'Snap-to-log', body: 'Estimate calories from a photo with AI' },
  { icon: 'infinite-outline', title: 'Unlimited AI logs', body: 'No daily caps, ever' },
  { icon: 'restaurant-outline', title: 'Macro breakdowns', body: 'Protein, carbs and fat per meal' },
  { icon: 'stats-chart-outline', title: 'Full history', body: 'Charts and trends for weeks' },
  { icon: 'time-outline', title: 'Widgets & Live Activity', body: 'Your calorie ring at a glance' },
];

type PlanKey = 'weekly' | 'yearly';

export function PaywallContent({ onClose }: { onClose?: () => void }) {
  const insets = useSafeAreaInsets();
  const pro = usePro();
  const [plan, setPlan] = useState<PlanKey>(() => (pro.yearly ? 'yearly' : 'weekly'));
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | undefined>(pro.error);

  const selected = plan === 'yearly' ? pro.yearly : pro.weekly;
  const fallback = pro.weekly ?? pro.yearly;
  const pkg = selected ?? fallback;

  const weeklyPerDay = useMemo(() => {
    if (!pro.weekly?.product?.price) return null;
    return (pro.weekly.product.price / 4.345) as number | null;
  }, [pro.weekly]);

  const yearlyPerDay = useMemo(() => {
    if (!pro.yearly?.product?.price) return null;
    return (pro.yearly.product.price / 52) as number | null;
  }, [pro.yearly]);

  async function onBuy() {
    if (!pkg) return;
    setBusy(true);
    setError(undefined);
    const ok = await pro.purchase(pkg);
    setBusy(false);
    if (ok) onClose?.();
  }

  async function onRestore() {
    setRestoring(true);
    setError(undefined);
    const ok = await pro.restore();
    setRestoring(false);
    if (ok) onClose?.();
  }

  return (
    <LinearGradient colors={[palette.bg, '#0F2A1C', palette.bg]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Ionicons name="diamond" size={14} color={palette.accent} />
              <AppText variant="xs" weight={700} color={palette.accent}>VITALS PRO</AppText>
            </View>
            {onClose ? (
              <Pressable hitSlop={10} onPress={onClose} style={styles.close}>
                <Ionicons name="close" size={22} color={palette.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          <AppText variant="display" weight={800} style={styles.headline}>
            Track every bite{'\n'}in <AppText variant="display" weight={800} color={palette.accent}>seconds</AppText>
          </AppText>
          <AppText variant="md" color={palette.textSecondary}>
            Just snap a photo and Vitals estimates the calories for you.
          </AppText>

          <View style={styles.perks}>
            {PERKS.map((p) => (
              <View key={p.title} style={styles.perk}>
                <View style={styles.perkIcon}>
                  <Ionicons name={p.icon as any} size={20} color={palette.accent} />
                </View>
                <View style={styles.perkText}>
                  <AppText variant="md" weight={700}>{p.title}</AppText>
                  <AppText variant="sm" color={palette.textSecondary}>{p.body}</AppText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            {pro.yearly ? (
              <PlanCard
                active={plan === 'yearly'}
                label="Yearly"
                badge="Best value"
                price={pro.yearly ? productPrice(pro.yearly) : ''}
                perDay={yearlyPerDay ? `$${yearlyPerDay.toFixed(2)}/day` : undefined}
                intro={formattedIntro(pro.yearly.product)}
                onPress={() => setPlan('yearly')}
              />
            ) : null}
            {pro.weekly ? (
              <PlanCard
                active={plan === 'weekly'}
                label="Weekly"
                price={pro.weekly ? productPrice(pro.weekly) : ''}
                perDay={weeklyPerDay ? `$${weeklyPerDay.toFixed(2)}/day` : undefined}
                intro={formattedIntro(pro.weekly.product)}
                onPress={() => setPlan('weekly')}
              />
            ) : null}
          </View>

          {!pkg ? (
            <View style={styles.noOffers}>
              <AppText variant="sm" color={palette.textTertiary} align="center">
                No subscription offers are available right now.
              </AppText>
            </View>
          ) : null}

          {error ? (
            <AppText variant="sm" color={palette.danger} align="center">{error}</AppText>
          ) : null}

          <Button
            title={pkg ? `Continue — ${productPrice(pkg)}` : 'Continue'}
            onPress={onBuy}
            loading={busy}
            disabled={!pkg}
            fullWidth
          />
          <Button title="Restore purchases" onPress={onRestore} loading={restoring} variant="ghost" />

          <AppText variant="xs" color={palette.textTertiary} align="center" style={styles.legal}>
            Subscription auto-renews until cancelled. Payment is charged to your App Store account.
            Manage or cancel anytime in Settings. Apple standard Terms of Use apply.
          </AppText>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function PlanCard({
  active,
  label,
  badge,
  price,
  perDay,
  intro,
  onPress,
}: {
  active: boolean;
  label: string;
  badge?: string;
  price: string;
  perDay?: string;
  intro?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.plan, active && styles.planActive]}>
      <View style={styles.planLeft}>
        <View style={styles.radio}>
          {active ? <View style={styles.radioInner} /> : null}
        </View>
        <View style={{ gap: 2 }}>
          <AppText variant="md" weight={700}>{label}</AppText>
          {intro ? <AppText variant="xs" color={palette.accent}>{intro}</AppText> : null}
        </View>
      </View>
      <View style={styles.planRight}>
        {perDay ? <AppText variant="xs" color={palette.textTertiary}>{perDay}</AppText> : null}
        <AppText variant="lg" weight={800} mono>{price}</AppText>
        {badge ? (
          <View style={styles.badgePill}>
            <AppText variant="xs" weight={700} color={palette.accent}>{badge}</AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.cardAlt, alignItems: 'center', justifyContent: 'center' },
  headline: { marginTop: Spacing.sm },
  perks: { gap: Spacing.lg, marginTop: Spacing.sm },
  perk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  perkIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: { flex: 1, gap: 1 },
  plans: { gap: Spacing.md },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: palette.bgElevated,
    borderWidth: 1.5,
    borderColor: palette.border,
    gap: Spacing.md,
  },
  planActive: { borderColor: palette.accent, backgroundColor: palette.accentSoft },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  planRight: { alignItems: 'flex-end', gap: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.accent },
  badgePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: palette.accentSoft,
  },
  noOffers: { paddingVertical: Spacing.sm },
  legal: { marginTop: Spacing.sm },
});
