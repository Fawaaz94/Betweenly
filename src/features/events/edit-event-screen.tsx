import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GhostButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useAppState } from '../app/app-context';
import EventEntryScreen from './log-event-screen';

export function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events } = useAppState();

  const event = useMemo(() => events.find((item) => item.id === id), [events, id]);

  if (!event) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Event not found" subtitle="This entry was removed or not available." />
        <GhostButton label="Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }
  return <EventEntryScreen mode="edit" initialEvent={event} />;
}
