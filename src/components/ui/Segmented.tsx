import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import { AppText } from './Text';

type Option<T extends string> = { label: string; value: T };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.seg, active && styles.segActive]}
          >
            <AppText variant="md" weight={active ? 700 : 500} color={active ? palette.text : palette.textSecondary}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: palette.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 3,
    gap: 3,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  segActive: { backgroundColor: palette.cardAlt },
});
