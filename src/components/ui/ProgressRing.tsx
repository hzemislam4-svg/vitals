import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { palette } from '@/constants/theme';

type Props = {
  size: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  /** Sweep of the ring in degrees (270 looks premium) */
  sweep?: number;
  children?: React.ReactNode;
};

export function ProgressRing({
  size,
  strokeWidth = 12,
  progress,
  color = palette.accent,
  trackColor = palette.border,
  sweep = 270,
  children,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = (circumference * sweep) / 360;
  const dashOffset = arc * (1 - clamped);
  const rotate = `${-(360 - sweep) / 2}deg`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </Svg>
      {children ? (
        <View style={[Style.absolute, { width: size, height: size }]}>{children}</View>
      ) : null}
    </View>
  );
}

const Style = { absolute: { position: 'absolute' as const, alignItems: 'center' as const, justifyContent: 'center' as const } };
