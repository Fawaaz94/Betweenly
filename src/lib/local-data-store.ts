import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultThemeMode, type ThemeMode } from '../constants/theme';
import { toDateInput } from './date';
import type { CycleData, IntimacyEvent, Partner, UserProfile } from '../types/models';

const STORAGE_KEY = 'betweenly.local.data.v1';

export type PersistedAppData = {
  user: UserProfile | null;
  events: IntimacyEvent[];
  partners: Partner[];
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
  cycleData: DEFAULT_CYCLE_DATA,
  themeMode: defaultThemeMode,
};

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export async function readPersistedAppData(): Promise<PersistedAppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_DATA;

  try {
    const parsed = asObject(JSON.parse(raw));
    return {
      user: (parsed.user as UserProfile | null) ?? null,
      events: (parsed.events as IntimacyEvent[]) ?? [],
      partners: (parsed.partners as Partner[]) ?? [],
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
