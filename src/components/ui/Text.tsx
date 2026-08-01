import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TextProps, ViewProps } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';

const SIZES: Record<Size, number> = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 17,
  xl: 20,
  '2xl': 26,
  display: 42,
};

type Props = TextProps & {
  variant?: Size;
  weight?: 400 | 500 | 600 | 700 | 800;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right';
  mono?: boolean;
};

export function AppText({
  variant = 'md',
  weight = 400,
  color,
  align,
  mono,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        {
          fontSize: SIZES[variant],
          fontWeight: weight,
          lineHeight: SIZES[variant] * (variant === 'display' ? 1.05 : 1.3),
          color: color ?? palette.text,
          textAlign: align,
        },
        mono && styles.mono,
        style,
      ]}
    />
  );
}

export function Label({ color = palette.textTertiary, children, ...rest }: Props) {
  return (
    <AppText variant="xs" weight={600} color={color} style={styles.label} {...rest}>
      {children}
    </AppText>
  );
}

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <AppText variant="md" weight={700}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  mono: { fontVariant: ['tabular-nums'] },
  label: { textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  card: {
    backgroundColor: palette.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
});
