import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  DEFAULT_CYCLE_DATA,
  deleteEvent as deleteEventFromDb,
  getCycleData,
  getThemeMode,
  getUserProfile,
  initDb,
  insertEvent,
  listEventsDesc,
  upsertThemeMode,
  upsertCycleData,
  upsertUserProfile,
} from '../../db/sqlite';
import { defaultThemeMode, getThemeColors, type ThemeColors, type ThemeMode } from '../../constants/theme';
import type { CreateEventInput, CycleData, IntimacyEvent, UserProfile } from '../../types/models';

type CreateProfileInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;
type UpdateUserInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;

type AppContextValue = {
  isBootstrapping: boolean;
  user: UserProfile | null;
  events: IntimacyEvent[];
  cycleData: CycleData;
  themeMode: ThemeMode;
  colors: ThemeColors;
  createProfile: (profile: CreateProfileInput) => Promise<void>;
  updateUser: (profile: UpdateUserInput) => Promise<void>;
  updateCycleData: (cycleData: Omit<CycleData, 'updatedAt'>) => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  saveEvent: (event: CreateEventInput) => Promise<IntimacyEvent>;
  deleteEvent: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<IntimacyEvent[]>([]);
  const [cycleData, setCycleData] = useState<CycleData>(DEFAULT_CYCLE_DATA);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    await initDb();

    const [profile, eventRows, cycle, theme] = await Promise.all([
      getUserProfile(),
      listEventsDesc(),
      getCycleData(),
      getThemeMode(),
    ]);

    setUser(profile);
    setEvents(eventRows);
    setCycleData(cycle);
    setThemeModeState(theme);
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const createProfile = useCallback(async (profile: CreateProfileInput) => {
    const saved = await upsertUserProfile(profile);
    setUser(saved);
  }, []);

  const updateUser = useCallback(async (profile: UpdateUserInput) => {
    const saved = await upsertUserProfile(profile);
    setUser(saved);
  }, []);

  const updateCycle = useCallback(async (nextCycleData: Omit<CycleData, 'updatedAt'>) => {
    const saved = await upsertCycleData(nextCycleData);
    setCycleData(saved);
  }, []);

  const setThemeMode = useCallback(async (nextThemeMode: ThemeMode) => {
    const saved = await upsertThemeMode(nextThemeMode);
    setThemeModeState(saved);
  }, []);

  const toggleThemeMode = useCallback(async () => {
    const nextThemeMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    const saved = await upsertThemeMode(nextThemeMode);
    setThemeModeState(saved);
  }, [themeMode]);

  const saveEvent = useCallback(async (event: CreateEventInput) => {
    const saved = await insertEvent(event);
    setEvents((previous) => [saved, ...previous].sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart)));
    return saved;
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await deleteEventFromDb(id);
    setEvents((previous) => previous.filter((event) => event.id !== id));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      isBootstrapping,
      user,
      events,
      cycleData,
      themeMode,
      colors: getThemeColors(themeMode),
      createProfile,
      updateUser,
      updateCycleData: updateCycle,
      setThemeMode,
      toggleThemeMode,
      saveEvent,
      deleteEvent,
    }),
    [
      createProfile,
      cycleData,
      deleteEvent,
      events,
      isBootstrapping,
      saveEvent,
      setThemeMode,
      themeMode,
      toggleThemeMode,
      updateCycle,
      updateUser,
      user,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used inside AppProvider.');
  }

  return context;
}
