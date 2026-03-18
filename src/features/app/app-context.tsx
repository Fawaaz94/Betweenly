import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { defaultThemeMode, getThemeColors, type ThemeColors, type ThemeMode } from '../../constants/theme';
import { DEFAULT_CYCLE_DATA, readPersistedAppData, writePersistedAppData, type PersistedAppData } from '../../lib/local-data-store';
import type {
  Activity,
  AppMedia,
  CreateActivityInput,
  CreateAppMediaInput,
  CreateEventInput,
  CreatePartnerInput,
  CycleData,
  IntimacyEvent,
  Partner,
  UpdateActivityInput,
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
  media: AppMedia[];
  activities: Activity[];
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
  saveMedia: (media: CreateAppMediaInput) => Promise<AppMedia>;
  deleteMedia: (id: string) => Promise<void>;
  saveActivity: (activity: CreateActivityInput) => Promise<Activity>;
  updateActivity: (id: string, updates: UpdateActivityInput) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<void>;
  setDefaultActivity: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function createEventId() {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function createPartnerId() {
  return `prt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function createActivityId() {
  return `act_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function createMediaId() {
  return `md_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<IntimacyEvent[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [media, setMedia] = useState<AppMedia[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cycleData, setCycleData] = useState<CycleData>(DEFAULT_CYCLE_DATA);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);

  const persist = useCallback(
    async (next: Partial<PersistedAppData>) => {
      await writePersistedAppData({
        user: next.user ?? user,
        events: next.events ?? events,
        partners: next.partners ?? partners,
        media: next.media ?? media,
        activities: next.activities ?? activities,
        cycleData: next.cycleData ?? cycleData,
        themeMode: next.themeMode ?? themeMode,
      });
    },
    [activities, cycleData, events, media, partners, themeMode, user],
  );

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    const data = await readPersistedAppData();
    setUser(data.user);
    setEvents(data.events);
    setPartners(data.partners);
    setMedia(data.media);
    setActivities(data.activities);
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

  const saveMedia = useCallback(
    async (input: CreateAppMediaInput) => {
      const now = new Date().toISOString();
      const saved: AppMedia = {
        ...input,
        id: createMediaId(),
        createdAt: now,
        updatedAt: now,
      };
      const nextMedia = [saved, ...media].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setMedia(nextMedia);
      await persist({ media: nextMedia });
      return saved;
    },
    [media, persist],
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      const nextMedia = media.filter((item) => item.id !== id);
      setMedia(nextMedia);
      await persist({ media: nextMedia });
    },
    [media, persist],
  );

  const saveActivity = useCallback(
    async (input: CreateActivityInput) => {
      const now = new Date().toISOString();
      const shouldBeDefault = activities.length === 0 ? true : input.isDefault;
      const saved: Activity = {
        ...input,
        isDefault: shouldBeDefault,
        id: createActivityId(),
        createdAt: now,
        updatedAt: now,
      };
      const nextActivities = [...activities, saved]
        .map((activity) =>
          saved.isDefault && activity.id !== saved.id
            ? {
                ...activity,
                isDefault: false,
              }
            : activity,
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setActivities(nextActivities);
      await persist({ activities: nextActivities });
      return saved;
    },
    [activities, persist],
  );

  const updateActivity = useCallback(
    async (id: string, updates: UpdateActivityInput) => {
      const existing = activities.find((activity) => activity.id === id);
      if (!existing) return null;

      const updated: Activity = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const nextActivitiesRaw = activities
        .map((activity) => (activity.id === id ? updated : activity))
        .map((activity) =>
          updated.isDefault && activity.id !== updated.id
            ? {
                ...activity,
                isDefault: false,
              }
            : activity,
        );

      const hasDefault = nextActivitiesRaw.some((activity) => activity.isDefault);
      const nextActivities = (hasDefault
        ? nextActivitiesRaw
        : nextActivitiesRaw.map((activity, index) => ({
            ...activity,
            isDefault: index === 0,
          }))
      ).sort((a, b) => a.name.localeCompare(b.name));

      setActivities(nextActivities);
      await persist({ activities: nextActivities });
      return updated;
    },
    [activities, persist],
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      const nextActivitiesRaw = activities.filter((activity) => activity.id !== id);
      const deletedWasDefault = activities.some((activity) => activity.id === id && activity.isDefault);

      const nextActivities =
        deletedWasDefault && nextActivitiesRaw.length > 0
          ? nextActivitiesRaw.map((activity, index) => ({
              ...activity,
              isDefault: index === 0 ? true : activity.isDefault,
            }))
          : nextActivitiesRaw;

      setActivities(nextActivities);
      await persist({ activities: nextActivities });
    },
    [activities, persist],
  );

  const setDefaultActivity = useCallback(
    async (id: string) => {
      const nextActivities = activities.map((activity) => ({
        ...activity,
        isDefault: activity.id === id,
      }));
      setActivities(nextActivities);
      await persist({ activities: nextActivities });
    },
    [activities, persist],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      isBootstrapping,
      user,
      events,
      partners,
      media,
      activities,
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
      saveMedia,
      deleteMedia,
      saveActivity,
      updateActivity,
      deleteActivity,
      setDefaultActivity,
    }),
    [
      activities,
      createProfile,
      cycleData,
      deleteMedia,
      deleteActivity,
      deleteEvent,
      deletePartner,
      events,
      isBootstrapping,
      media,
      partners,
      saveEvent,
      saveMedia,
      saveActivity,
      savePartner,
      setDefaultActivity,
      setThemeMode,
      themeMode,
      toggleThemeMode,
      updateActivity,
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
