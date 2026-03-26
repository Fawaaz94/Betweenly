export type InsightIconName =
  | 'calendar-outline'
  | 'heart'
  | 'timer-outline'
  | 'stats-chart-outline'
  | 'people'
  | 'walk'
  | 'paw'
  | 'moon'
  | 'water';

export type PartnerAvatar = {
  id: string;
  initial: string;
  color: string;
};

export type InsightTrendPoint = {
  label: string;
  value: number;
};

export type InsightsHeroRange = 'last_week' | 'last_30_days' | 'year';

export type InsightHeroData = {
  rangeLabel: string;
  points: InsightTrendPoint[];
  peakDayLabel: string;
  badgeLabel: string;
  hasActivity: boolean;
};

export type InsightStatData = {
  id: string;
  label: string;
  value: string;
  meta: string;
  icon: InsightIconName;
  iconColor?: string;
};

export type TopPartnerData = {
  names: string[];
  moreCount: number;
  avatars: PartnerAvatar[];
};

export type PositionBreakdownItem = {
  id: string;
  label: string;
  percent: number;
  color: string;
  icon: InsightIconName;
};

export type InsightsViewModel = {
  hero: InsightHeroData;
  statCards: InsightStatData[];
  topPartner: TopPartnerData;
  breakdown: PositionBreakdownItem[];
};
