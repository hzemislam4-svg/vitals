import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps, ViewStyle } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import { AppText } from './Text';

type Props = TextInputProps & {
  label?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
  right?: React.ReactNode;
};

export function Field({ label, prefix, suffix, containerStyle, right, style, ...rest }: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <AppText variant="xs" weight={600} color={palette.textTertiary} style={styles.label}>{label}</AppText> : null}
      <View style={styles.inputRow}>
        {prefix ? <AppText variant="md" color={palette.textTertiary} style={styles.prefix}>{prefix}</AppText> : null}
        <TextInput
          placeholderTextColor={palette.textTertiary}
          selectionColor={palette.accent}
          {...rest}
          style={[styles.input, right ? styles.inputWithRight : null, style]}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
        {suffix ? <AppText variant="md" color={palette.textTertiary} style={styles.suffix}>{suffix}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  label: { marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  inputWithRight: { paddingRight: Spacing.sm },
  prefix: { marginRight: Spacing.sm },
  suffix: { marginLeft: Spacing.sm },
  right: { marginLeft: Spacing.sm },
});
