import { toDateInput } from '../../lib/date';
import type { IntimacyEvent } from '../../types/models';
import type { InsightHeroData, InsightTrendPoint, InsightsHeroRange } from './components/insights-types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

type HeroBucketType = 'day' | 'period' | 'month';

type HeroSeries = {
  points: InsightTrendPoint[];
  bucketType: HeroBucketType;
};

type HeroHighlight = {
  peakLabel: string;
  badgeLabel: string;
  hasActivity: boolean;
};

export const INSIGHTS_HERO_RANGE_OPTIONS: Array<{ id: InsightsHeroRange; label: string }> = [
  { id: 'last_week', label: 'Last week' },
  { id: 'last_30_days', label: 'Last 30 days' },
  { id: 'year', label: '1 year' },
];

export function getInsightsRangeLabel(range: InsightsHeroRange) {
  if (range === 'last_week') return 'Last week';
  if (range === 'year') return '1 year';
  return 'Last 30 days';
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isValidDate(value: Date) {
  return !Number.isNaN(+value);
}

function getEventCountsByDayKey(events: IntimacyEvent[], startDate: Date, endDate: Date) {
  const counts = new Map<string, number>();

  for (const event of events) {
    const parsed = new Date(event.dateTimeStart);
    if (!isValidDate(parsed)) continue;

    const day = startOfDay(parsed);
    if (+day < +startDate || +day > +endDate) continue;

    const dayKey = toDateInput(day);
    counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
  }

  return counts;
}

function buildLastWeekSeries(events: IntimacyEvent[], now: Date): HeroSeries {
  const endDate = startOfDay(now);
  const startDate = addDays(endDate, -6);
  const countsByDayKey = getEventCountsByDayKey(events, startDate, endDate);

  const points: InsightTrendPoint[] = Array.from({ length: 7 }, (_, index) => {
    const currentDate = addDays(startDate, index);
    const dayKey = toDateInput(currentDate);
    return {
      label: currentDate.toLocaleDateString(undefined, { weekday: 'short' }),
      value: countsByDayKey.get(dayKey) ?? 0,
    };
  });

  return {
    points,
    bucketType: 'day',
  };
}

function buildLast30DaysSeries(events: IntimacyEvent[], now: Date): HeroSeries {
  const endDate = startOfDay(now);
  const startDate = addDays(endDate, -29);
  const countsByDayKey = getEventCountsByDayKey(events, startDate, endDate);
  const bucketSize = 5;
  const totalBuckets = Math.ceil(30 / bucketSize);

  const points: InsightTrendPoint[] = Array.from({ length: totalBuckets }, (_, bucketIndex) => {
    const bucketStart = addDays(startDate, bucketIndex * bucketSize);
    let total = 0;

    for (let dayOffset = 0; dayOffset < bucketSize; dayOffset += 1) {
      const current = addDays(bucketStart, dayOffset);
      if (+current > +endDate) break;
      total += countsByDayKey.get(toDateInput(current)) ?? 0;
    }

    return {
      label: bucketStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: total,
    };
  });

  return {
    points,
    bucketType: 'period',
  };
}

function buildCurrentYearSeries(events: IntimacyEvent[], now: Date): HeroSeries {
  const year = now.getFullYear();
  const countsByMonth = Array.from({ length: 12 }, () => 0);

  for (const event of events) {
    const parsed = new Date(event.dateTimeStart);
    if (!isValidDate(parsed)) continue;
    if (parsed.getFullYear() !== year) continue;
    countsByMonth[parsed.getMonth()] += 1;
  }

  const points: InsightTrendPoint[] = MONTH_LABELS.map((label, monthIndex) => ({
    label,
    value: countsByMonth[monthIndex] ?? 0,
  }));

  return {
    points,
    bucketType: 'month',
  };
}

export function getHeroSeriesForRange(events: IntimacyEvent[], range: InsightsHeroRange, now = new Date()): HeroSeries {
  if (range === 'last_week') return buildLastWeekSeries(events, now);
  if (range === 'year') return buildCurrentYearSeries(events, now);
  return buildLast30DaysSeries(events, now);
}

export function getHeroHighlight(points: InsightTrendPoint[], bucketType: HeroBucketType): HeroHighlight {
  const peakValue = points.reduce((max, point) => Math.max(max, point.value), 0);
  if (peakValue <= 0) {
    return {
      peakLabel: '',
      badgeLabel:
        bucketType === 'month'
          ? 'No activity this year'
          : bucketType === 'period'
            ? 'No activity in last 30 days'
            : 'No activity this week',
      hasActivity: false,
    };
  }

  let peakPoint = points[0];
  for (const point of points) {
    if (point.value > peakPoint.value) peakPoint = point;
  }

  const prefix = bucketType === 'month' ? 'Peak Month' : bucketType === 'period' ? 'Peak 5-Day Window' : 'Peak Day';
  return {
    peakLabel: peakPoint.label,
    badgeLabel: `${prefix}: ${peakPoint.label}`,
    hasActivity: true,
  };
}

export function buildInsightsHeroData(events: IntimacyEvent[], range: InsightsHeroRange, now = new Date()): InsightHeroData {
  const series = getHeroSeriesForRange(events, range, now);
  const highlight = getHeroHighlight(series.points, series.bucketType);

  return {
    rangeLabel: getInsightsRangeLabel(range),
    points: series.points,
    peakDayLabel: highlight.peakLabel,
    badgeLabel: highlight.badgeLabel,
    hasActivity: highlight.hasActivity,
  };
}
