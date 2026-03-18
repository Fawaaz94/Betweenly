import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyText, ScreenContainer, ScreenTitle, SectionTitle } from '../../components/ui/primitives';
import { calculateStreak } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';
import type { IntimacyEvent } from '../../types/models';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

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

  const insights = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dayCounts = Array.from({ length: 7 }, () => 0);
    const hourCounts = Array.from({ length: 24 }, () => 0);
    let spontaneousCount = 0;

    for (const event of events) {
      const parsed = new Date(event.dateTimeStart);
      if (!Number.isNaN(+parsed)) {
        dayCounts[parsed.getDay()] += 1;
        hourCounts[parsed.getHours()] += 1;
      }

      const isQuickCounter = event.location.trim().toLowerCase() === 'quick counter';
      if (isQuickCounter || event.durationMinutes === 0) spontaneousCount += 1;
    }

    const mostActiveDayIndex = dayCounts.reduce((best, current, index, source) => (current > source[best] ? index : best), 0);
    const mostActiveHour = hourCounts.reduce((best, current, index, source) => (current > source[best] ? index : best), 0);
    const maxDayCount = Math.max(1, ...dayCounts);

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
      dayCounts,
      maxDayCount,
      mostActiveDayLabel: DAY_LABELS[mostActiveDayIndex] ?? '—',
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
        barsRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: theme.spacing.xs,
        },
        dayColumn: {
          flex: 1,
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        dayBarTrack: {
          width: '100%',
          height: 54,
          borderRadius: theme.radius.md,
          backgroundColor: colors.surfaceAlt,
          justifyContent: 'flex-end',
          overflow: 'hidden',
        },
        dayBarFill: {
          width: '100%',
          borderRadius: theme.radius.md,
          backgroundColor: colors.accent,
          minHeight: 3,
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
      <View style={styles.wideCard}>
        <Text style={styles.metricLabel}>Peak Day</Text>
        <Text style={styles.metricValue}>{insights.mostActiveDayLabel}</Text>
        <View style={styles.barsRow}>
          {DAY_LABELS.map((day, index) => {
            const heightPercent = Math.max(6, Math.round((insights.dayCounts[index] / insights.maxDayCount) * 100));
            return (
              <View key={day} style={styles.dayColumn}>
                <View style={styles.dayBarTrack}>
                  <View style={[styles.dayBarFill, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
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
