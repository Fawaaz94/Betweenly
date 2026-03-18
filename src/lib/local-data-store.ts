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
    isDefault: activity.isDefault,
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
    isDefault: Boolean(partner.isDefault),
    avatarUri: partner.avatarUri ?? null,
    avatarAssetId: partner.avatarAssetId ?? null,
  };
}

function normalizePartners(partners: Partner[]): Partner[] {
  const normalized = partners.map(normalizePartner);

  let hasSeenDefault = false;
  return normalized.map((partner) => {
    if (!partner.isDefault) return partner;
    if (!hasSeenDefault) {
      hasSeenDefault = true;
      return partner;
    }
    return {
      ...partner,
      isDefault: false,
    };
  });
}

function normalizeActivities(activities: Activity[]): Activity[] {
  if (activities.length === 0) return DEFAULT_DATA.activities;

  const normalized = activities.map((activity) => ({
    ...activity,
    isDefault: Boolean(activity.isDefault),
  }));

  if (!normalized.some((activity) => activity.isDefault)) {
    const sexIndex = normalized.findIndex((activity) => activity.name.trim().toLowerCase() === 'sex');
    const defaultIndex = sexIndex >= 0 ? sexIndex : 0;
    normalized[defaultIndex] = {
      ...normalized[defaultIndex],
      isDefault: true,
    };
  }

  let hasSeenDefault = false;
  return normalized.map((activity) => {
    if (!activity.isDefault) return activity;
    if (!hasSeenDefault) {
      hasSeenDefault = true;
      return activity;
    }
    return {
      ...activity,
      isDefault: false,
    };
  });
}

export async function readPersistedAppData(): Promise<PersistedAppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_DATA;

  try {
    const parsed = asObject(JSON.parse(raw));
    const partners = Array.isArray(parsed.partners) ? normalizePartners(parsed.partners as Partner[]) : [];
    return {
      user: (parsed.user as UserProfile | null) ?? null,
      events: (parsed.events as IntimacyEvent[]) ?? [],
      partners,
      media: Array.isArray(parsed.media) ? (parsed.media as AppMedia[]) : [],
      activities: Array.isArray(parsed.activities)
        ? normalizeActivities(parsed.activities as Activity[])
        : DEFAULT_DATA.activities,
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
