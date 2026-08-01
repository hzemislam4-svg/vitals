import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  haptic?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  iconSize = 18,
  style,
  fullWidth,
}: Props) {
  const isDisabled = disabled || loading;
  const tint = variant === 'primary' ? '#0A0D12' : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons name={icon} size={iconSize} color={tint} style={styles.icon} />
          ) : null}
          <Text style={[styles.label, { color: tint }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: Spacing.sm },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primary: { backgroundColor: palette.accent },
  secondary: {
    backgroundColor: palette.cardAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: palette.danger },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
