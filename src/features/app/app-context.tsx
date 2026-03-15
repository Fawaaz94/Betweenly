import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { defaultThemeMode, getThemeColors, type ThemeColors, type ThemeMode } from '../../constants/theme';
import { DEFAULT_CYCLE_DATA, readPersistedAppData, writePersistedAppData, type PersistedAppData } from '../../lib/local-data-store';
import type {
  CreateEventInput,
  CreatePartnerInput,
  CycleData,
  IntimacyEvent,
  Partner,
  UpdateEventInput,
  UpdatePartnerInput,
  UserProfile,
} from '../../types/models';

type CreateProfileInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;
type UpdateUserInput = Pick<UserProfile, 'email' | 'displayName' | 'relationshipMode' | 'cycleTrackingEnabled'>;

type AppContextValue = {
  isBootstrapping: boolean;
  user: UserProfile | null;
  events: IntimacyEvent[];
  partners: Partner[];
  cycleData: CycleData;
  themeMode: ThemeMode;
  colors: ThemeColors;
  createProfile: (profile: CreateProfileInput) => Promise<void>;
  updateUser: (profile: UpdateUserInput) => Promise<void>;
  updateCycleData: (cycleData: Omit<CycleData, 'updatedAt'>) => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  saveEvent: (event: CreateEventInput) => Promise<IntimacyEvent>;
  updateEvent: (id: string, updates: UpdateEventInput) => Promise<IntimacyEvent | null>;
  deleteEvent: (id: string) => Promise<void>;
  savePartner: (partner: CreatePartnerInput) => Promise<Partner>;
  updatePartner: (id: string, updates: UpdatePartnerInput) => Promise<Partner | null>;
  deletePartner: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function createEventId() {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function createPartnerId() {
  return `prt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<IntimacyEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cycleData, setCycleData] = useState<CycleData>(DEFAULT_CYCLE_DATA);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);

  const persist = useCallback(
    async (next: Partial<PersistedAppData>) => {
      await writePersistedAppData({
        user: next.user ?? user,
        events: next.events ?? events,
        partners: next.partners ?? partners,
        cycleData: next.cycleData ?? cycleData,
        themeMode: next.themeMode ?? themeMode,
      });
    },
    [cycleData, events, partners, themeMode, user],
  );

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    const data = await readPersistedAppData();
    setUser(data.user);
    setEvents(data.events);
    setPartners(data.partners);
    setCycleData(data.cycleData);
    setThemeModeState(data.themeMode);
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const createProfile = useCallback(
    async (profile: CreateProfileInput) => {
      const now = new Date().toISOString();
      const nextUser: UserProfile = {
        ...profile,
        createdAt: user?.createdAt ?? now,
        updatedAt: now,
      };
      setUser(nextUser);
      await persist({ user: nextUser });
    },
    [persist, user?.createdAt],
  );

  const updateUser = useCallback(
    async (profile: UpdateUserInput) => {
      const now = new Date().toISOString();
      const nextUser: UserProfile = {
        ...profile,
        createdAt: user?.createdAt ?? now,
        updatedAt: now,
      };
      setUser(nextUser);
      await persist({ user: nextUser });
    },
    [persist, user?.createdAt],
  );

  const updateCycle = useCallback(
    async (nextCycleData: Omit<CycleData, 'updatedAt'>) => {
      const next: CycleData = {
        ...nextCycleData,
        updatedAt: new Date().toISOString(),
      };
      setCycleData(next);
      await persist({ cycleData: next });
    },
    [persist],
  );

  const setThemeMode = useCallback(
    async (nextThemeMode: ThemeMode) => {
      setThemeModeState(nextThemeMode);
      await persist({ themeMode: nextThemeMode });
    },
    [persist],
  );

  const toggleThemeMode = useCallback(async () => {
    const nextThemeMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeModeState(nextThemeMode);
    await persist({ themeMode: nextThemeMode });
  }, [persist, themeMode]);

  const saveEvent = useCallback(
    async (input: CreateEventInput) => {
      const now = new Date().toISOString();
      const saved: IntimacyEvent = {
        ...input,
        id: createEventId(),
        createdAt: now,
        updatedAt: now,
      };

      const nextEvents = [...events, saved].sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart));
      setEvents(nextEvents);
      await persist({ events: nextEvents });
      return saved;
    },
    [events, persist],
  );

  const updateEvent = useCallback(
    async (id: string, updates: UpdateEventInput) => {
      const existing = events.find((event) => event.id === id);
      if (!existing) return null;

      const updated: IntimacyEvent = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const nextEvents = events.map((event) => (event.id === id ? updated : event)).sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart));
      setEvents(nextEvents);
      await persist({ events: nextEvents });
      return updated;
    },
    [events, persist],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const nextEvents = events.filter((event) => event.id !== id);
      setEvents(nextEvents);
      await persist({ events: nextEvents });
    },
    [events, persist],
  );

  const savePartner = useCallback(
    async (input: CreatePartnerInput) => {
      const now = new Date().toISOString();
      const saved: Partner = {
        ...input,
        id: createPartnerId(),
        createdAt: now,
        updatedAt: now,
      };
      const nextPartners = [...partners, saved].sort((a, b) => a.name.localeCompare(b.name));
      setPartners(nextPartners);
      await persist({ partners: nextPartners });
      return saved;
    },
    [partners, persist],
  );

  const updatePartner = useCallback(
    async (id: string, updates: UpdatePartnerInput) => {
      const existing = partners.find((partner) => partner.id === id);
      if (!existing) return null;

      const updated: Partner = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const nextPartners = partners.map((partner) => (partner.id === id ? updated : partner)).sort((a, b) => a.name.localeCompare(b.name));
      setPartners(nextPartners);
      await persist({ partners: nextPartners });
      return updated;
    },
    [partners, persist],
  );

  const deletePartner = useCallback(
    async (id: string) => {
      const nextPartners = partners.filter((partner) => partner.id !== id);
      setPartners(nextPartners);
      await persist({ partners: nextPartners });
    },
    [partners, persist],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      isBootstrapping,
      user,
      events,
      partners,
      cycleData,
      themeMode,
      colors: getThemeColors(themeMode),
      createProfile,
      updateUser,
      updateCycleData: updateCycle,
      setThemeMode,
      toggleThemeMode,
      saveEvent,
      updateEvent,
      deleteEvent,
      savePartner,
      updatePartner,
      deletePartner,
    }),
    [
      createProfile,
      cycleData,
      deleteEvent,
      deletePartner,
      events,
      isBootstrapping,
      partners,
      saveEvent,
      savePartner,
      setThemeMode,
      themeMode,
      toggleThemeMode,
      updateEvent,
      updatePartner,
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
