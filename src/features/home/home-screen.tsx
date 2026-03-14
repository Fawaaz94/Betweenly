import { useRouter } from 'expo-router';
import { EventCard } from '../../components/events/event-card';
import {
  EmptyText,
  NoteText,
  PrimaryButton,
  ScreenContainer,
  ScreenTitle,
  SectionTitle,
  StatRow,
} from '../../components/ui/primitives';
import { calculateStreak, getCyclePhase, toDateInput } from '../../lib/date';
import { useAppState } from '../app/app-context';

export function HomeScreen() {
  const router = useRouter();
  const { user, events, cycleData } = useAppState();

  if (!user) {
    return null;
  }

  const today = toDateInput(new Date());
  const todayCount = events.filter((event) => event.dateTimeStart.startsWith(today)).length;
  const streakDays = calculateStreak(events);
  const cyclePhase = user.cycleTrackingEnabled ? getCyclePhase(cycleData, new Date()) : null;

  return (
    <ScreenContainer>
      <ScreenTitle title={`Welcome, ${user.displayName}`} subtitle="Today at a glance" />

      <StatRow label="Today entries" value={String(todayCount)} />
      <StatRow label="Current streak" value={`${streakDays} day${streakDays === 1 ? '' : 's'}`} />
      <StatRow label="Next planned invite" value="Not set" />
      {cyclePhase ? <StatRow label="Cycle snapshot" value={cyclePhase} /> : null}

      <PrimaryButton label="Quick log event" onPress={() => router.push('/(tabs)/log')} />

      <SectionTitle>Recent history</SectionTitle>
      {events.length === 0 ? (
        <EmptyText>No entries yet. Add your first event from Log Event.</EmptyText>
      ) : (
        events.slice(0, 10).map((event) => (
          <EventCard key={event.id} event={event} onPress={(eventId) => router.push(`/events/${eventId}`)} />
        ))
      )}

      <NoteText>Private notes remain local to this device in V1.</NoteText>
    </ScreenContainer>
  );
}
