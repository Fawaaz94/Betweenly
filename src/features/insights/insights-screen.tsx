import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionMenuModal } from '../../components/ui/action-menu-modal';
import { ScreenContainer } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import type { Theme, ThemeColors } from '../../theme';
import { useAppState } from '../app/app-context';
import { InsightsFilterPill } from './components/insights-filter-pill';
import { InsightsHeroCard } from './components/insights-hero-card';
import { InsightsStatCard, TopPartnerStatCard } from './components/insights-stat-card';
import type { InsightStatData, InsightsHeroRange, InsightsViewModel } from './components/insights-types';
import { PositionsBreakdownCard } from './components/positions-breakdown-card';
import { buildInsightsHeroData, getInsightsRangeLabel, INSIGHTS_HERO_RANGE_OPTIONS } from './insights-analytics';
import type { IntimacyEvent } from '../../types/models';

const BASE_INSIGHTS_MODEL: InsightsViewModel = {
  hero: {
    rangeLabel: 'Last 30 days',
    points: [
      { label: 'Sun', value: 3 },
      { label: 'Mon', value: 2 },
      { label: 'Tue', value: 3 },
      { label: 'Wed', value: 4 },
      { label: 'Thu', value: 6 },
      { label: 'Fri', value: 4 },
      { label: 'Sat', value: 2 },
    ],
    peakDayLabel: 'Thu',
    badgeLabel: 'Most Active Day!',
    hasActivity: true,
  },
  statCards: [
    {
      id: 'total-sessions',
      label: 'Total Sessions',
      value: '14',
      meta: '',
      icon: 'heart',
    },
    {
      id: 'total-time',
      label: 'Total Time Spent',
      value: '5h 36m',
      meta: '',
      icon: 'timer-outline',
    },
    {
      id: 'avg-week',
      label: 'Avg. Sessions Per Week',
      value: 'At least 3',
      meta: '+1 vs last month',
      icon: 'calendar-outline',
    },
  ],
  topPartner: {
    names: ['Lona', 'Lex'],
    moreCount: 1,
    avatars: [
      { id: 'lona', initial: 'L', color: '#B68DBF' },
      { id: 'lex', initial: 'L', color: '#7FB98F' },
      { id: 'other', initial: '+', color: '#D6A7A7' },
    ],
  },
  breakdown: [
    { id: 'missionary', label: 'Missionary', percent: 40, color: '#E995B1', icon: 'heart' },
    { id: 'doggy-style', label: 'Doggy Style', percent: 32, color: '#F2B46B', icon: 'paw' },
    { id: 'cowgirl', label: 'Cowgirl', percent: 18, color: '#90C4E5', icon: 'walk' },
    { id: 'oral', label: 'Oral', percent: 10, color: '#9A90E3', icon: 'water' },
  ],
};

function formatDuration(totalMinutes: number) {
  const safe = Math.max(0, totalMinutes);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function buildInsightsViewModel(events: IntimacyEvent[], range: InsightsHeroRange): InsightsViewModel {
  const totalDuration = events.reduce((sum, event) => sum + Math.max(0, event.durationMinutes), 0);

  const patchedStatCards: InsightStatData[] = BASE_INSIGHTS_MODEL.statCards.map((card) => {
    if (card.id === 'total-sessions') return { ...card, value: String(events.length) };
    if (card.id === 'total-time') return { ...card, value: formatDuration(totalDuration) };
    return card;
  });

  return {
    ...BASE_INSIGHTS_MODEL,
    hero: buildInsightsHeroData(events, range),
    statCards: patchedStatCards,
  };
}

export function InsightsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { events } = useAppState();
  const [selectedRange, setSelectedRange] = useState<InsightsHeroRange>('last_30_days');
  const [isRangeMenuVisible, setIsRangeMenuVisible] = useState(false);
  const model = useMemo(() => buildInsightsViewModel(events, selectedRange), [events, selectedRange]);
  const selectedRangeLabel = useMemo(() => getInsightsRangeLabel(selectedRange), [selectedRange]);
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  return (
    <ScreenContainer>
      <View style={styles.stack}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/');
            }}
            style={({ pressed }) => [styles.headerNavButton, pressed ? styles.headerNavButtonPressed : null]}
          >
            <Ionicons name="chevron-back" size={theme.sizing.iconMd} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Insights</Text>
          <View style={styles.headerSpacer} />
        </View>

        <InsightsFilterPill
          label={selectedRangeLabel}
          theme={theme}
          colors={colors}
          onPress={() => {
            setIsRangeMenuVisible(true);
          }}
        />

        <InsightsHeroCard data={model.hero} theme={theme} colors={colors} />

        <View style={styles.statsGrid}>
          <View style={styles.metricRow}>
            <InsightsStatCard {...model.statCards[0]} compact theme={theme} colors={colors} />
            <InsightsStatCard {...model.statCards[1]} compact theme={theme} colors={colors} />
          </View>

          <View style={styles.metricRow}>
            <InsightsStatCard {...model.statCards[2]} theme={theme} colors={colors} />
            <TopPartnerStatCard
              data={model.topPartner}
              theme={theme}
              colors={colors}
              onPress={() => router.push('/partner/shared')}
            />
          </View>
        </View>

        <PositionsBreakdownCard items={model.breakdown} theme={theme} colors={colors} />
      </View>

      <ActionMenuModal
        visible={isRangeMenuVisible}
        title="Time Range"
        onClose={() => setIsRangeMenuVisible(false)}
        options={INSIGHTS_HERO_RANGE_OPTIONS.map((option) => ({
          key: option.id,
          label: option.id === selectedRange ? `✓ ${option.label}` : option.label,
          onPress: () => {
            setSelectedRange(option.id);
          },
        }))}
      />
    </ScreenContainer>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  return StyleSheet.create({
    stack: {
      gap: theme.spacing.sm + 2,
    },
    headerRow: {
      marginTop: theme.spacing.xxs,
      marginBottom: theme.spacing.xxs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerNavButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.14 : 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    headerNavButtonPressed: {
      opacity: 0.86,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.xxl,
      lineHeight: theme.typography.lineHeight.xxl,
      fontWeight: '700',
    },
    headerSpacer: {
      width: 36,
      height: 36,
    },
    statsGrid: {
      gap: theme.spacing.sm,
    },
    metricRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignItems: 'stretch',
    },
  });
}
