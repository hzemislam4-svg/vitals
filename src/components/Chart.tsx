import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { palette, Radius, Spacing } from '@/constants/theme';
import { AppText } from './ui/Text';

export type ChartBar = {
  label: string;
  calories: number;
  goal: number;
  selected?: boolean;
};

export function BarChart({ bars, height = 180 }: { bars: ChartBar[]; height?: number }) {
  const max = Math.max(1, ...bars.map((b) => b.calories), ...bars.map((b) => b.goal));
  const top = max * 1.12;
  const chartW = 100;
  const gap = 8;
  const barW = (chartW - gap * (bars.length - 1)) / bars.length;
  const innerH = height - 20;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${chartW} ${height}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = innerH - innerH * f;
          return (
            <Line
              key={f}
              x1={0}
              x2={chartW}
              y1={y}
              y2={y}
              stroke={palette.borderSoft}
              strokeWidth={0.3}
              strokeDasharray="2 2"
            />
          );
        })}
        {bars.map((b, i) => {
          const x = i * (barW + gap);
          const bh = (Math.min(b.calories, top) / top) * innerH;
          const y = innerH - bh;
          const isOver = b.calories > b.goal;
          const fill = b.selected
            ? isOver
              ? palette.fat
              : palette.accent
            : isOver
              ? palette.fat
              : palette.accentDim;
          return <Rect key={i} x={x} y={y} width={barW} height={Math.max(2, bh)} rx={2} fill={fill} />;
        })}
      </Svg>
      <View style={styles.labels}>
        {bars.map((b, i) => (
          <View key={i} style={[styles.labelCol, i === bars.length - 1 && { alignItems: 'flex-end' }]}>
            <AppText variant="xs" weight={b.selected ? 800 : 500} color={b.selected ? palette.text : palette.textTertiary} mono>
              {b.calories}
            </AppText>
            <AppText variant="xs" color={palette.textTertiary}>{b.label}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ChartCard({
  title,
  period,
  bars,
  height,
}: {
  title: string;
  period: string;
  bars: ChartBar[];
  height?: number;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitle}>
          <AppText variant="md" weight={700}>{title}</AppText>
          <AppText variant="xs" color={palette.textTertiary}>{period}</AppText>
        </View>
        <LegendRow />
      </View>
      <BarChart bars={bars} height={height} />
    </View>
  );
}

export function LegendRow() {
  return (
    <View style={styles.legend}>
      <LegendItem color={palette.accent} label="Under goal" />
      <LegendItem color={palette.fat} label="Over goal" />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText variant="xs" color={palette.textTertiary}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm, marginTop: Spacing.sm },
  card: {
    backgroundColor: palette.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: Spacing.lg,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { gap: 2 },
  legend: { flexDirection: 'row', gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  labels: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  labelCol: { flex: 1, alignItems: 'flex-start', gap: 1 },
});
