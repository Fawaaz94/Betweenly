import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Theme, ThemeColors } from '../../../theme';
import type { InsightHeroData } from './insights-types';

const CHART_HEIGHT = 132;
const CHART_INSET_HORIZONTAL = 12;
const CHART_INSET_TOP = 11;
const CHART_AXIS_OFFSET = 18;
const CHART_POINT_SIZE = 9;
const CHART_LINE_THICKNESS = 2;
const CHART_PEAK_RING_SIZE = 17;

type InsightsHeroCardProps = {
  data: InsightHeroData;
  theme: Theme;
  colors: ThemeColors;
};

type HeroPoint = {
  x: number;
  y: number;
  value: number;
  label: string;
  barHeight: number;
};

type HeroSegment = {
  key: string;
  left: number;
  top: number;
  width: number;
  angle: number;
};

export function InsightsHeroCard({ data, theme, colors }: InsightsHeroCardProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const styles = createStyles(theme, colors);
  const isDenseLabels = data.points.length > 8;

  const chart = useMemo(() => {
    const axisY = CHART_HEIGHT - CHART_AXIS_OFFSET;
    if (chartWidth <= CHART_INSET_HORIZONTAL * 2 || data.points.length === 0) {
      return { axisY, points: [] as HeroPoint[], segments: [] as HeroSegment[], peakIndex: null as number | null };
    }

    const peakValue = Math.max(0, ...data.points.map((point) => point.value));
    const maxValue = peakValue > 0 ? peakValue : 1;
    const chartSpan = chartWidth - CHART_INSET_HORIZONTAL * 2;
    const step = data.points.length > 1 ? chartSpan / (data.points.length - 1) : 0;
    const topY = CHART_INSET_TOP;
    const bottomY = axisY - 14;
    const yRange = Math.max(1, bottomY - topY);
    const barMaxHeight = axisY - (topY + 6);

    const points = data.points.map((point, index) => {
      const ratio = point.value / maxValue;
      const x = CHART_INSET_HORIZONTAL + step * index;
      const y = bottomY - ratio * yRange;
      const barHeight = point.value > 0 ? Math.max(10, ratio * barMaxHeight) : 0;
      return { x, y, value: point.value, label: point.label, barHeight };
    });

    let peakIndex: number | null = null;
    if (peakValue > 0) {
      peakIndex = 0;
      points.forEach((point, index) => {
        if (peakIndex === null) return;
        if (point.value > points[peakIndex].value) peakIndex = index;
      });
    }

    const segments: HeroSegment[] = points.slice(0, -1).map((point, index) => {
      const nextPoint = points[index + 1];
      const deltaX = nextPoint.x - point.x;
      const deltaY = nextPoint.y - point.y;
      const length = Math.max(1, Math.hypot(deltaX, deltaY));
      const angle = Math.atan2(deltaY, deltaX);

      return {
        key: `${point.label}-${nextPoint.label}`,
        left: (point.x + nextPoint.x) / 2 - length / 2,
        top: (point.y + nextPoint.y) / 2 - CHART_LINE_THICKNESS / 2,
        width: length,
        angle,
      };
    });

    return { axisY, points, segments, peakIndex };
  }, [chartWidth, data.points]);
  const peakPoint = chart.peakIndex === null ? null : chart.points[chart.peakIndex];

  return (
    <View style={styles.card}>
      <View style={styles.softBlobOne} />
      <View style={styles.softBlobTwo} />
      <View style={styles.sparkleA} />
      <View style={styles.sparkleB} />
      <View style={styles.sparkleC} />

      {data.hasActivity ? (
        <View style={styles.celebrationWrap}>
          <Ionicons name="trophy" size={theme.sizing.iconXl} color={colors.accent} />
        </View>
      ) : null}

      <View style={styles.chartSurface}>
        <View
          style={styles.plot}
          onLayout={(event) => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            setChartWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
          }}
        >
          {[0.25, 0.5, 0.75].map((ratio) => (
            <View
              key={`grid-${ratio}`}
              style={[
                styles.gridLine,
                {
                  top: chart.axisY - ratio * (chart.axisY - CHART_INSET_TOP),
                },
              ]}
            />
          ))}
          <View style={styles.axisLine} />

          {chart.points.map((point, index) => (
            <View
              key={`${point.label}-${index}-bar`}
              style={[
                styles.bar,
                {
                  left: point.x - 10,
                  top: chart.axisY - point.barHeight,
                  height: point.barHeight,
                },
              ]}
            />
          ))}

          {data.hasActivity
            ? chart.segments.map((segment) => (
                <View
                  key={segment.key}
                  style={[
                    styles.segment,
                    {
                      left: segment.left,
                      top: segment.top,
                      width: segment.width,
                      transform: [{ rotateZ: `${segment.angle}rad` }],
                    },
                  ]}
                />
              ))
            : null}

          {peakPoint && data.hasActivity ? (
            <View
              style={[
                styles.dotPeakRing,
                {
                  left: peakPoint.x - CHART_PEAK_RING_SIZE / 2,
                  top: peakPoint.y - CHART_PEAK_RING_SIZE / 2,
                },
              ]}
            />
          ) : null}

          {data.hasActivity
            ? chart.points.map((point, index) => (
                <View
                  key={`${point.label}-${index}-dot`}
                  style={[
                    styles.dot,
                    {
                      left: point.x - CHART_POINT_SIZE / 2,
                      top: point.y - CHART_POINT_SIZE / 2,
                    },
                    index === chart.peakIndex ? styles.dotPeak : null,
                  ]}
                />
              ))
            : null}

          {!data.hasActivity ? <Text style={styles.emptyHint}>No entries for this range yet</Text> : null}
        </View>

        <View style={styles.dayRow}>
          {data.points.map((point) => (
            <Text key={`${point.label}-day`} style={[styles.dayLabel, isDenseLabels ? styles.dayLabelDense : null]}>
              {point.label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.badgeWrap}>
        <Ionicons name={data.hasActivity ? 'sparkles' : 'analytics-outline'} size={theme.sizing.iconSm} color={colors.accent} />
        <Text style={[styles.badgeText, !data.hasActivity ? styles.badgeTextMuted : null]} numberOfLines={1}>
          {data.badgeLabel}
        </Text>
      </View>
    </View>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  const cardTint = theme.mode === 'dark' ? colors.surface : '#FBEAF0';
  const chartTint = theme.mode === 'dark' ? colors.surfaceAlt : '#FAF0F5';
  const barColor = theme.mode === 'dark' ? '#D6778F' : '#E6A2B8';
  const lineColor = theme.mode === 'dark' ? '#F394AE' : '#D97593';

  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: theme.radius.xxl,
      backgroundColor: cardTint,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      overflow: 'hidden',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 9 },
      shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.11,
      shadowRadius: 20,
      elevation: 6,
    },
    softBlobOne: {
      position: 'absolute',
      width: 156,
      height: 156,
      borderRadius: 78,
      backgroundColor: colors.selectedSurface,
      right: -42,
      top: -30,
      opacity: 0.6,
    },
    softBlobTwo: {
      position: 'absolute',
      width: 98,
      height: 98,
      borderRadius: 49,
      backgroundColor: colors.selectedSurface,
      right: 34,
      top: 4,
      opacity: 0.35,
    },
    sparkleA: {
      position: 'absolute',
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: '#FFFFFF',
      right: 98,
      top: 30,
      opacity: 0.7,
    },
    sparkleB: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      right: 120,
      top: 48,
      opacity: 0.56,
    },
    sparkleC: {
      position: 'absolute',
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: '#FFFFFF',
      right: 60,
      top: 42,
      opacity: 0.5,
    },
    celebrationWrap: {
      position: 'absolute',
      right: theme.spacing.md,
      top: theme.spacing.md,
      opacity: 0.72,
    },
    chartSurface: {
      borderRadius: theme.radius.xl,
      backgroundColor: chartTint,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: theme.spacing.xxs + 1,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.xs + 2,
      overflow: 'hidden',
    },
    plot: {
      height: CHART_HEIGHT,
      position: 'relative',
    },
    gridLine: {
      position: 'absolute',
      left: CHART_INSET_HORIZONTAL,
      right: CHART_INSET_HORIZONTAL,
      height: 1,
      backgroundColor: colors.borderMuted,
      opacity: 0.8,
    },
    axisLine: {
      position: 'absolute',
      left: CHART_INSET_HORIZONTAL,
      right: CHART_INSET_HORIZONTAL,
      bottom: CHART_AXIS_OFFSET,
      height: 1,
      backgroundColor: colors.border,
    },
    bar: {
      position: 'absolute',
      width: 20,
      borderRadius: theme.radius.sm,
      backgroundColor: barColor,
      opacity: 0.92,
    },
    segment: {
      position: 'absolute',
      height: CHART_LINE_THICKNESS,
      borderRadius: theme.radius.pill,
      backgroundColor: lineColor,
    },
    dot: {
      position: 'absolute',
      width: CHART_POINT_SIZE,
      height: CHART_POINT_SIZE,
      borderRadius: CHART_POINT_SIZE / 2,
      backgroundColor: lineColor,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    dotPeakRing: {
      position: 'absolute',
      width: CHART_PEAK_RING_SIZE,
      height: CHART_PEAK_RING_SIZE,
      borderRadius: CHART_PEAK_RING_SIZE / 2,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
      backgroundColor: '#FFFFFF55',
    },
    dotPeak: {
      width: CHART_POINT_SIZE + 2,
      height: CHART_POINT_SIZE + 2,
      borderRadius: (CHART_POINT_SIZE + 2) / 2,
      borderWidth: 1.8,
      borderColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    dayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: CHART_INSET_HORIZONTAL,
      marginTop: theme.spacing.xs,
      minHeight: theme.typography.lineHeight.sm,
      alignItems: 'center',
    },
    dayLabel: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm - 1,
      lineHeight: theme.typography.lineHeight.sm - 1,
      fontWeight: '600',
      textAlign: 'center',
    },
    dayLabelDense: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs - 1,
    },
    badgeWrap: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: CHART_HEIGHT / 2 + 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm + 1,
      paddingVertical: theme.spacing.xs - 1,
      minHeight: 26,
      maxWidth: '78%',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    badgeText: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm - 1,
      lineHeight: theme.typography.lineHeight.sm - 2,
      fontWeight: '700',
      flexShrink: 1,
    },
    badgeTextMuted: {
      color: colors.textSecondary,
    },
    emptyHint: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: CHART_HEIGHT / 2 - 8,
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.sm - 1,
      lineHeight: theme.typography.lineHeight.sm - 1,
      fontWeight: '600',
    },
  });
}
