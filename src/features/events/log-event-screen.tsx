import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { EventFormScreen } from './event-form';
import { createDefaultLogEventValues } from '../../lib/validations';
import { useAppState } from '../app/app-context';

export function LogEventScreen() {
  const router = useRouter();
  const { saveEvent, user } = useAppState();
  const initialValues = useMemo(
    () =>
      createDefaultLogEventValues(user?.relationshipMode === 'linked'),
    [user?.relationshipMode],
  );

  return (
    <EventFormScreen
      title="Log Event"
      subtitle="Private shared-experience reflection"
      initialValues={initialValues}
      ownerUserId={user?.email}
      submitLabel="Save event"
      successMessage="Saved securely. Opening event details..."
      onSubmit={async (input) => {
        const saved = await saveEvent(input);
        return saved.id;
      }}
      onSuccess={(eventId) => {
        router.replace(`/events/${eventId}`);
      }}
    />
  );
}
