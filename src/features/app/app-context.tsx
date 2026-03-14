import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  DEFAULT_CYCLE_DATA,
  deleteEvent as deleteEventFromDb,
  getCycleData,
  getUserProfile,
  initDb,
  insertEvent,
  listEventsDesc,
  upsertCycleData,
  upsertUserProfile,
} from '../../db/sqlite';
import type { CreateEventInput, CycleData, IntimacyEvent, UserProfile } from '../../types/models';

type CreateProfileInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;
type UpdateUserInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;

type AppContextValue = {
  isBootstrapping: boolean;
  user: UserProfile | null;
  events: IntimacyEvent[];
  cycleData: CycleData;
  createProfile: (profile: CreateProfileInput) => Promise<void>;
  updateUser: (profile: UpdateUserInput) => Promise<void>;
  updateCycleData: (cycleData: Omit<CycleData, 'updatedAt'>) => Promise<void>;
  saveEvent: (event: CreateEventInput) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<IntimacyEvent[]>([]);
  const [cycleData, setCycleData] = useState<CycleData>(DEFAULT_CYCLE_DATA);

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    await initDb();

    const [profile, eventRows, cycle] = await Promise.all([getUserProfile(), listEventsDesc(), getCycleData()]);

    setUser(profile);
    setEvents(eventRows);
    setCycleData(cycle);
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

  const saveEvent = useCallback(async (event: CreateEventInput) => {
    const saved = await insertEvent(event);
    setEvents((previous) => [saved, ...previous].sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart)));
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
      createProfile,
      updateUser,
      updateCycleData: updateCycle,
      saveEvent,
      deleteEvent,
    }),
    [createProfile, cycleData, deleteEvent, events, isBootstrapping, saveEvent, updateCycle, updateUser, user],
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
