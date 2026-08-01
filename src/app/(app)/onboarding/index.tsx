import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { palette, Radius, Spacing } from '@/constants/theme';

const BENEFITS = [
  { icon: 'camera-outline', text: 'Snap a photo of your meal and get instant calorie & macro estimates.' },
  { icon: 'pie-chart-outline', text: 'Clear daily ring and macro targets that keep you on track.' },
  { icon: 'stats-chart-outline', text: 'Readable charts to spot trends across weeks.' },
] as const;

export default function OnboardingWelcome() {
  const router = useRouter();
  return (
    <LinearGradient colors={[palette.bg, '#0E2418', palette.bg]} style={styles.gradient}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons name="flame" size={34} color={palette.accent} />
        </View>
        <AppText variant="display" weight={800} style={styles.title}>
          Vitals
        </AppText>
        <AppText variant="lg" color={palette.textSecondary}>
          Track every bite in seconds.
        </AppText>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefit}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={20} color={palette.accent} />
              </View>
              <AppText variant="md" color={palette.textSecondary} style={styles.benefitText}>
                {b.text}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Get started" fullWidth onPress={() => router.push('/onboarding/profile')} />
        <AppText variant="xs" color={palette.textTertiary} align="center">
          Free plan includes 3 AI photo logs per day.
        </AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: 'space-between', padding: Spacing.xl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
  logo: {
    width: 76,
    height: 76,
    borderRadius: Radius.xl,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { letterSpacing: -1 },
  benefits: { gap: Spacing.lg, marginTop: Spacing.xl, width: '100%' },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: palette.cardAlt,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1 },
  footer: { gap: Spacing.md, maxWidth: 480, alignSelf: 'center', width: '100%' },
});
