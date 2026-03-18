import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ACTIVITY_TEMPLATES } from '../constants/activities';
import { defaultThemeMode, type ThemeMode } from '../constants/theme';
import { toDateInput } from './date';
import type { Activity, AppMedia, CycleData, IntimacyEvent, Partner, UserProfile } from '../types/models';

const STORAGE_KEY = 'betweenly.local.data.v1';

export type PersistedAppData = {
  user: UserProfile | null;
  events: IntimacyEvent[];
  partners: Partner[];
  media: AppMedia[];
  activities: Activity[];
  cycleData: CycleData;
  themeMode: ThemeMode;
};

export const DEFAULT_CYCLE_DATA: CycleData = {
  lastPeriodStart: toDateInput(new Date()),
  averageCycleLength: 28,
  averagePeriodLength: 5,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_DATA: PersistedAppData = {
  user: null,
  events: [],
  partners: [],
  media: [],
  activities: DEFAULT_ACTIVITY_TEMPLATES.map((activity, index) => ({
    id: `act_default_${index + 1}`,
    name: activity.name,
    icon: activity.icon,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  })),
  cycleData: DEFAULT_CYCLE_DATA,
  themeMode: defaultThemeMode,
};

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizePartner(partner: Partner): Partner {
  return {
    ...partner,
    avatarUri: partner.avatarUri ?? null,
    avatarAssetId: partner.avatarAssetId ?? null,
  };
}

export async function readPersistedAppData(): Promise<PersistedAppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_DATA;

  try {
    const parsed = asObject(JSON.parse(raw));
    const partners = Array.isArray(parsed.partners) ? (parsed.partners as Partner[]).map(normalizePartner) : [];
    return {
      user: (parsed.user as UserProfile | null) ?? null,
      events: (parsed.events as IntimacyEvent[]) ?? [],
      partners,
      media: Array.isArray(parsed.media) ? (parsed.media as AppMedia[]) : [],
      activities: Array.isArray(parsed.activities) ? (parsed.activities as Activity[]) : DEFAULT_DATA.activities,
      cycleData: (parsed.cycleData as CycleData) ?? DEFAULT_CYCLE_DATA,
      themeMode: (parsed.themeMode as ThemeMode) ?? defaultThemeMode,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writePersistedAppData(data: PersistedAppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
