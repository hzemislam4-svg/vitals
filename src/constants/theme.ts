import { Platform } from 'react-native';

/**
 * Vitals design system — a dark, premium, health-first palette.
 * Force dark everywhere for a consistent, focused experience.
 */
export const palette = {
  bg: '#0A0D12',
  bgElevated: '#0F141B',
  card: '#141B24',
  cardAlt: '#1A2230',
  border: '#232C3B',
  borderSoft: '#1A2230',
  text: '#F3F6FB',
  textSecondary: '#9AA6BA',
  textTertiary: '#5E6A7E',
  accent: '#7DD956',
  accentDim: 'rgba(125, 217, 86, 0.38)',
  accentSoft: 'rgba(125, 217, 86, 0.14)',
  accentBorder: 'rgba(125, 217, 86, 0.35)',
  protein: '#5AB8FF',
  proteinSoft: 'rgba(90, 184, 255, 0.14)',
  carbs: '#F5B04C',
  carbsSoft: 'rgba(245, 176, 76, 0.14)',
  fat: '#FF7A92',
  fatSoft: 'rgba(255, 122, 146, 0.14)',
  danger: '#FF6B6B',
  warning: '#FFC24B',
  overlay: 'rgba(5, 8, 12, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ThemeColor = keyof typeof palette;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const Fonts = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' })!,
  rounded: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: 'var(--font-rounded)',
    default: 'System',
  })!,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: 'var(--font-mono)',
    default: 'monospace',
  })!,
} as const;

/** Tab bar height + safe area allowance for scroll padding */
export const BottomTabInset = Platform.select({ ios: 96, android: 104 }) ?? 96;

export const MaxContentWidth = 600;
