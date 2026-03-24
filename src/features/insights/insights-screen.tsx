import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyText, ScreenContainer, ScreenTitle, SectionTitle } from '../../components/ui/primitives';
import { calculateStreak } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';
import type { IntimacyEvent } from '../../types/models';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const TIMING_CHART_HEIGHT = 92;
const TIMING_CHART_HORIZONTAL_INSET = 12;
const TIMING_CHART_TOP_INSET = 8;
const TIMING_CHART_AXIS_BOTTOM_OFFSET = 10;
const TIMING_CHART_MIN_POINT_GAP = 14;
const TIMING_CHART_LINE_THICKNESS = 2;
const TIMING_CHART_DOT_SIZE = 10;
const TIMING_CHART_TAIL_OPACITY_SOFT = 0.12;
const TIMING_CHART_TAIL_OPACITY_MID = 0.34;
const TIMING_CHART_TAIL_MIN_LENGTH = 8;
const TIMING_CHART_TAIL_MAX_LENGTH = 16;

type TimingChartPoint = {
  label: (typeof DAY_LABELS)[number];
  x: number;
  y: number;
};

type TimingChartSegment = {
  key: string;
  left: number;
  top: number;
  width: number;
  angle: number;
  opacity: number;
};

function buildTimingSegment(key: string, startX: number, startY: number, endX: number, endY: number, opacity = 1): TimingChartSegment {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const length = Math.max(1, Math.hypot(deltaX, deltaY));
  const angle = Math.atan2(deltaY, deltaX);

  return {
    key,
    left: (startX + endX) / 2 - length / 2,
    top: (startY + endY) / 2 - TIMING_CHART_LINE_THICKNESS / 2,
    width: length,
    angle,
    opacity,
  };
}

function normalizeLabel(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function formatHourLabel(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric' });
}

function getLongestStreak(events: IntimacyEvent[]) {
  const uniqueDayKeys = Array.from(new Set(events.map((event) => event.dateTimeStart.slice(0, 10)))).sort();
  if (uniqueDayKeys.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let index = 1; index < uniqueDayKeys.length; index += 1) {
    const previous = new Date(`${uniqueDayKeys[index - 1]}T00:00:00`);
    const next = new Date(`${uniqueDayKeys[index]}T00:00:00`);
    if (Number.isNaN(+previous) || Number.isNaN(+next)) continue;

    const diffDays = Math.round((+next - +previous) / 86_400_000);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function getTopLabel(values: string[]) {
  if (values.length === 0) return { label: 'No data yet', count: 0 };

  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let bestLabel = '';
  let bestCount = 0;
  for (const [label, count] of counts.entries()) {
    if (count > bestCount) {
      bestLabel = label;
      bestCount = count;
    }
  }

  return { label: bestLabel, count: bestCount };
}

export function InsightsScreen() {
  const { colors, theme } = useTheme();
  const { events } = useAppState();
  const [timingChartWidth, setTimingChartWidth] = useState(0);

  const insights = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfWeek.getDate() + 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const weekDayCounts = Array.from({ length: 7 }, () => 0);
    const hourCounts = Array.from({ length: 24 }, () => 0);
    let spontaneousCount = 0;

    for (const event of events) {
      const parsed = new Date(event.dateTimeStart);
      if (!Number.isNaN(+parsed)) {
        if (+parsed >= +startOfWeek && +parsed < +startOfNextWeek) {
          weekDayCounts[parsed.getDay()] += 1;
        }
        hourCounts[parsed.getHours()] += 1;
      }

      const isQuickCounter = event.location.trim().toLowerCase() === 'quick counter';
      if (isQuickCounter || event.durationMinutes === 0) spontaneousCount += 1;
    }

    const mostActiveDayIndex = weekDayCounts.reduce((best, current, index, source) => (current > source[best] ? index : best), 0);
    const mostActiveHour = hourCounts.reduce((best, current, index, source) => (current > source[best] ? index : best), 0);
    const hasWeekEntries = weekDayCounts.some((count) => count > 0);
    const maxWeekDayCount = Math.max(1, ...weekDayCounts);

    const weekTotal = events.filter((event) => +new Date(event.dateTimeStart) >= +startOfWeek).length;
    const monthTotal = events.filter((event) => +new Date(event.dateTimeStart) >= +startOfMonth).length;
    const currentStreak = calculateStreak(events);
    const longestStreak = getLongestStreak(events);
    const averageRating = events.length ? (events.reduce((sum, event) => sum + event.overallRating, 0) / events.length).toFixed(1) : '0.0';
    const averageDuration = events.length ? Math.round(events.reduce((sum, event) => sum + event.durationMinutes, 0) / events.length) : 0;

    const topPartner = getTopLabel(events.map((event) => normalizeLabel(event.partnerName, '')).filter(Boolean));
    const topActivity = getTopLabel(events.map((event) => normalizeLabel(event.positions, 'Activity')));

    const uniqueActivities = new Set(events.map((event) => normalizeLabel(event.positions, 'Activity').toLowerCase())).size;
    const uniquePartners = new Set(events.map((event) => normalizeLabel(event.partnerName, '').toLowerCase()).filter(Boolean)).size;
    const highRatingShare = events.length ? events.filter((event) => event.overallRating >= 4).length / events.length : 0;
    const adventureScore = Math.min(
      100,
      Math.round(uniqueActivities * 12 + uniquePartners * 10 + Math.min(events.length, 30) * 1.2 + highRatingShare * 24),
    );

    const plannedCount = Math.max(0, events.length - spontaneousCount);
    const spontaneousPercent = events.length ? Math.round((spontaneousCount / events.length) * 100) : 0;

    return {
      weekTotal,
      monthTotal,
      currentStreak,
      longestStreak,
      weekDayCounts,
      maxWeekDayCount,
      mostActiveDayLabel: hasWeekEntries ? (DAY_LABELS[mostActiveDayIndex] ?? '—') : '—',
      goldenHourLabel: formatHourLabel(mostActiveHour),
      averageRating,
      averageDuration,
      topPartner,
      topActivity,
      adventureScore,
      plannedCount,
      spontaneousCount,
      spontaneousPercent,
    };
  }, [events]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        metricRow: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        metricCard: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.xs,
        },
        metricLabel: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        metricValue: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
        },
        metricMeta: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '600',
        },
        wideCard: {
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.sm,
        },
        timingCard: {
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xxl,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.sm,
        },
        timingChartPlot: {
          height: TIMING_CHART_HEIGHT,
          position: 'relative',
          marginTop: theme.spacing.xs,
        },
        timingAxis: {
          position: 'absolute',
          left: TIMING_CHART_HORIZONTAL_INSET,
          right: TIMING_CHART_HORIZONTAL_INSET,
          bottom: TIMING_CHART_AXIS_BOTTOM_OFFSET,
          height: 1,
          backgroundColor: colors.border,
        },
        timingGuide: {
          position: 'absolute',
          width: 0,
          borderLeftWidth: 1,
          borderLeftColor: colors.borderMuted,
          borderStyle: 'dashed',
          opacity: theme.mode === 'dark' ? 0.85 : 0.95,
        },
        timingSegment: {
          position: 'absolute',
          height: TIMING_CHART_LINE_THICKNESS,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.accent,
        },
        timingPoint: {
          position: 'absolute',
          width: TIMING_CHART_DOT_SIZE,
          height: TIMING_CHART_DOT_SIZE,
          borderRadius: TIMING_CHART_DOT_SIZE / 2,
          backgroundColor: colors.accent,
          borderWidth: 1,
          borderColor: colors.surface,
        },
        timingLabelsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: TIMING_CHART_HORIZONTAL_INSET,
        },
        dayLabel: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs - 1,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '600',
        },
        note: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        meterTrack: {
          height: 10,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.surfaceAlt,
          overflow: 'hidden',
        },
        meterFill: {
          height: '100%',
          borderRadius: theme.radius.pill,
          backgroundColor: colors.accent,
        },
      }),
    [colors, theme],
  );

  const timingChart = useMemo(() => {
    const axisY = TIMING_CHART_HEIGHT - TIMING_CHART_AXIS_BOTTOM_OFFSET;
    if (timingChartWidth <= TIMING_CHART_HORIZONTAL_INSET * 2) {
      return { axisY, points: [], segments: [] };
    }

    const chartWidth = timingChartWidth - TIMING_CHART_HORIZONTAL_INSET * 2;
    const step = DAY_LABELS.length > 1 ? chartWidth / (DAY_LABELS.length - 1) : 0;
    const topY = TIMING_CHART_TOP_INSET;
    const bottomY = axisY - TIMING_CHART_MIN_POINT_GAP;
    const yRange = Math.max(1, bottomY - topY);

    const points: TimingChartPoint[] = DAY_LABELS.map((label, index) => {
      const dayCount = insights.weekDayCounts[index] ?? 0;
      const ratio = insights.maxWeekDayCount > 0 ? dayCount / insights.maxWeekDayCount : 0;
      const x = TIMING_CHART_HORIZONTAL_INSET + step * index;
      const y = bottomY - ratio * yRange;
      return { label, x, y };
    });

    const segments: TimingChartSegment[] = points
      .slice(0, -1)
      .map((point, index) => buildTimingSegment(`${point.label}-${points[index + 1].label}`, point.x, point.y, points[index + 1].x, points[index + 1].y));

    if (points.length >= 1) {
      const tailLength = Math.max(TIMING_CHART_TAIL_MIN_LENGTH, Math.min(TIMING_CHART_TAIL_MAX_LENGTH, step * 0.45));
      const first = points[0];
      const last = points[points.length - 1];
      const leftSoftX = Math.max(2, first.x - tailLength);
      const leftMidX = first.x - tailLength * 0.48;
      const rightMidX = last.x + tailLength * 0.48;
      const rightSoftX = Math.min(timingChartWidth - 2, last.x + tailLength);

      segments.unshift(buildTimingSegment('tail-left-soft', leftSoftX, first.y, leftMidX, first.y, TIMING_CHART_TAIL_OPACITY_SOFT));
      segments.unshift(buildTimingSegment('tail-left-mid', leftMidX, first.y, first.x, first.y, TIMING_CHART_TAIL_OPACITY_MID));
      segments.push(buildTimingSegment('tail-right-mid', last.x, last.y, rightMidX, last.y, TIMING_CHART_TAIL_OPACITY_MID));
      segments.push(buildTimingSegment('tail-right-soft', rightMidX, last.y, rightSoftX, last.y, TIMING_CHART_TAIL_OPACITY_SOFT));
    }

    return { axisY, points, segments };
  }, [insights.maxWeekDayCount, insights.weekDayCounts, timingChartWidth]);

  return (
    <ScreenContainer>
      <ScreenTitle
        title="Insights"
        subtitle={events.length ? `Private snapshot from ${events.length} entries` : 'Your private spark map starts here'}
      />

      {events.length === 0 ? (
        <EmptyText>Log a few events to unlock streaks, golden hour, top activity, and your adventure meter.</EmptyText>
      ) : null}

      <SectionTitle>Frequency</SectionTitle>
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>This Week</Text>
          <Text style={styles.metricValue}>{insights.weekTotal}</Text>
          <Text style={styles.metricMeta}>entries</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>This Month</Text>
          <Text style={styles.metricValue}>{insights.monthTotal}</Text>
          <Text style={styles.metricMeta}>entries</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Spark Streak</Text>
          <Text style={styles.metricValue}>{insights.currentStreak}</Text>
          <Text style={styles.metricMeta}>days in a row</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Personal Best</Text>
          <Text style={styles.metricValue}>{insights.longestStreak}</Text>
          <Text style={styles.metricMeta}>longest streak</Text>
        </View>
      </View>

      <SectionTitle>Timing</SectionTitle>
      <View style={styles.timingCard}>
        <Text style={styles.metricLabel}>Peak Day</Text>
        <Text style={styles.metricValue}>{insights.mostActiveDayLabel}</Text>
        <View
          style={styles.timingChartPlot}
          onLayout={(event) => {
            const nextWidth = Math.round(event.nativeEvent.layout.width);
            setTimingChartWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
          }}
        >
          <View style={styles.timingAxis} />
          {timingChart.points.map((point) => {
            const pointBottom = point.y + TIMING_CHART_DOT_SIZE / 2;
            return (
              <View
                key={`${point.label}-guide`}
                style={[
                  styles.timingGuide,
                  {
                    left: point.x,
                    top: pointBottom,
                    height: Math.max(0, timingChart.axisY - pointBottom),
                  },
                ]}
              />
            );
          })}
          {timingChart.segments.map((segment) => (
            <View
              key={segment.key}
              style={[
                styles.timingSegment,
                {
                  left: segment.left,
                  top: segment.top,
                  width: segment.width,
                  opacity: segment.opacity,
                  transform: [{ rotateZ: `${segment.angle}rad` }],
                },
              ]}
            />
          ))}
          {timingChart.points.map((point) => (
            <View
              key={`${point.label}-point`}
              style={[
                styles.timingPoint,
                {
                  left: point.x - TIMING_CHART_DOT_SIZE / 2,
                  top: point.y - TIMING_CHART_DOT_SIZE / 2,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.timingLabelsRow}>
          {DAY_LABELS.map((day) => (
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Golden Hour</Text>
          <Text style={styles.metricValue}>{insights.goldenHourLabel}</Text>
          <Text style={styles.metricMeta}>most common start time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Average Session</Text>
          <Text style={styles.metricValue}>{insights.averageDuration} min</Text>
          <Text style={styles.metricMeta}>duration</Text>
        </View>
      </View>

      <SectionTitle>People & Play</SectionTitle>
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Top Connection</Text>
          <Text style={styles.metricValue}>{insights.topPartner.label}</Text>
          <Text style={styles.metricMeta}>{insights.topPartner.count} entries</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Top Activity</Text>
          <Text style={styles.metricValue}>{insights.topActivity.label}</Text>
          <Text style={styles.metricMeta}>{insights.topActivity.count} entries</Text>
        </View>
      </View>

      <SectionTitle>Mood & Flow</SectionTitle>
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Vibe Score</Text>
          <Text style={styles.metricValue}>{insights.averageRating} / 5</Text>
          <Text style={styles.metricMeta}>average rating</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Adventure Meter</Text>
          <Text style={styles.metricValue}>{insights.adventureScore}</Text>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${insights.adventureScore}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.wideCard}>
        <Text style={styles.metricLabel}>Planner Ratio</Text>
        <Text style={styles.metricValue}>
          {insights.plannedCount} planned | {insights.spontaneousCount} spontaneous
        </Text>
        <Text style={styles.note}>
          {insights.spontaneousPercent}% spontaneous (derived from quick-counter or zero-minute entries)
        </Text>
      </View>
    </ScreenContainer>
  );
}
