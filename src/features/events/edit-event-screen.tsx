import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GhostButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { createLogEventFormValuesFromEvent } from '../../lib/validations';
import { useAppState } from '../app/app-context';
import { EventFormScreen } from './event-form';

export function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, updateEvent, user } = useAppState();

  const event = useMemo(() => events.find((item) => item.id === id), [events, id]);

  if (!event) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Event not found" subtitle="This entry was removed or not available." />
        <GhostButton label="Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const initialValues = useMemo(() => createLogEventFormValuesFromEvent(event), [event]);

  return (
    <EventFormScreen
      title="Edit Event"
      subtitle="Update your private reflection"
      initialValues={initialValues}
      ownerUserId={user?.email ?? event.ownerUserId}
      submitLabel="Save changes"
      successMessage="Changes saved. Opening event details..."
      onSubmit={async (input) => {
        const updated = await updateEvent(event.id, input);
        if (!updated) {
          throw new Error('Unable to update this event.');
        }
        return updated.id;
      }}
      onSuccess={(eventId) => {
        router.replace(`/events/${eventId}`);
      }}
    />
  );
}
