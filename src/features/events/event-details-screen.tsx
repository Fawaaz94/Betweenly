import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { Card, CardBody, CardTitle, DangerButton, GhostButton, Row, ScreenContainer, ScreenTitle, StatRow } from '../../components/ui/primitives';
import { formatDateTime } from '../../lib/date';
import { useAppState } from '../app/app-context';

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>{value}</CardBody>
    </Card>
  );
}

export function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, deleteEvent } = useAppState();

  const event = events.find((item) => item.id === id);

  if (!event) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Event not found" subtitle="This entry was removed or not available." />
        <GhostButton label="Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenTitle title="Event Details" subtitle={formatDateTime(event.dateTimeStart)} />

      <StatRow label="Owner" value={event.ownerUserId} />
      <StatRow label="Type" value={event.eventType} />
      <StatRow label="Partner" value={event.partnerName || '-'} />
      <StatRow label="Duration" value={`${event.durationMinutes} minutes`} />
      <StatRow label="Location" value={event.location || '-'} />
      <StatRow label="Overall rating" value={`${event.overallRating}/5`} />
      <StatRow label="Emotional rating" value={`${event.emotionalRating}/5`} />
      <StatRow label="Visibility" value={event.isSharedWithPartner ? 'Shared' : 'Private'} />
      <StatRow label="End time" value={event.dateTimeEnd ? formatDateTime(event.dateTimeEnd) : '-'} />

      {event.notes ? <DetailBlock title="Notes" value={event.notes} /> : null}
      {event.positions ? <DetailBlock title="Positions / activities" value={event.positions} /> : null}
      {event.toysUsed ? <DetailBlock title="Toys used" value={event.toysUsed} /> : null}
      {event.whatWorkedWell ? <DetailBlock title="What worked well" value={event.whatWorkedWell} /> : null}
      {event.whatToTryNext ? <DetailBlock title="What to try next" value={event.whatToTryNext} /> : null}

      <Row>
        <GhostButton label="Close" onPress={() => router.back()} />
        <DangerButton
          label="Delete"
          onPress={() => {
            Alert.alert('Delete event?', 'This removes the entry from this device.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await deleteEvent(event.id);
                  router.replace('/(tabs)');
                },
              },
            ]);
          }}
        />
      </Row>
    </ScreenContainer>
  );
}
