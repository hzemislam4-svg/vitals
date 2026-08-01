import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, MaxContentWidth, Spacing } from '@/constants/theme';
import { AppText } from './Text';

type Props = ScrollViewProps & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentPadding?: number;
  keyboard?: boolean;
};

export function Screen({ header, footer, contentPadding = Spacing.lg, children, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: contentPadding, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        {...rest}
      >
        <View style={styles.inner}>
          {header}
          {children}
          {footer}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleWrap}>
      <AppText variant="display" weight={800} style={styles.title}>
        {title}
      </AppText>
      {subtitle ? <AppText variant="md" color={palette.textSecondary}>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  content: { flexGrow: 1 },
  inner: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
  titleWrap: { gap: Spacing.sm, marginBottom: Spacing.xs },
  title: { letterSpacing: -0.8 },
});
