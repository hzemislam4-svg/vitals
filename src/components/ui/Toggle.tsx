import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, Radius } from '@/constants/theme';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ value, onValueChange, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value && styles.trackOn, disabled && styles.disabled]}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: palette.cardAlt,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 2,
  },
  trackOn: { backgroundColor: palette.accentSoft, borderColor: palette.accentBorder },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.textTertiary,
  },
  knobOn: { backgroundColor: palette.accent, transform: [{ translateX: 20 }] },
  disabled: { opacity: 0.4 },
});
