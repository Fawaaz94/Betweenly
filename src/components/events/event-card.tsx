import { Pressable } from 'react-native';
import { Card, CardBody, CardMeta, CardTitle } from '../ui/primitives';
import { formatDateTime } from '../../lib/date';
import type { IntimacyEvent } from '../../types/models';

export function EventCard({ event, onPress }: { event: IntimacyEvent; onPress: (eventId: string) => void }) {
  return (
    <Pressable onPress={() => onPress(event.id)}>
      <Card>
        <CardTitle>{event.eventType === 'solo' ? 'Solo' : 'Partnered'} experience</CardTitle>
        <CardMeta>
          {formatDateTime(event.dateTimeStart)} • {event.durationMinutes} min • Rating {event.overallRating}/5
        </CardMeta>
        {event.notes ? <CardBody>{event.notes}</CardBody> : null}
      </Card>
    </Pressable>
  );
}
