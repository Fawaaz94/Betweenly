import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { MonthCalendar } from '../../components/calendar/month-calendar';
import { EventCard } from '../../components/events/event-card';
import { EmptyText, GhostButton, Row, ScreenContainer, ScreenTitle, SectionTitle } from '../../components/ui/primitives';
import { toDateInput } from '../../lib/date';
import { useAppState } from '../app/app-context';

export function CalendarScreen() {
  const router = useRouter();
  const { events } = useAppState();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toDateInput(new Date()));

  const selectedDayEvents = useMemo(
    () => events.filter((event) => event.dateTimeStart.slice(0, 10) === selectedDate),
    [events, selectedDate],
  );

  return (
    <ScreenContainer>
      <ScreenTitle title="Calendar" subtitle="Monthly history view" />

      <Row style={{ justifyContent: 'space-between' }}>
        <GhostButton
          label="Prev"
          onPress={() => {
            const next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
            setCursor(next);
            setSelectedDate(toDateInput(next));
          }}
        />
        <SectionTitle>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</SectionTitle>
        <GhostButton
          label="Next"
          onPress={() => {
            const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
            setCursor(next);
            setSelectedDate(toDateInput(next));
          }}
        />
      </Row>

      <MonthCalendar
        year={cursor.getFullYear()}
        month={cursor.getMonth()}
        selectedDate={selectedDate}
        events={events}
        onSelectDate={setSelectedDate}
      />

      <SectionTitle>Events on {selectedDate}</SectionTitle>
      {selectedDayEvents.length === 0 ? (
        <EmptyText>No entries on this day.</EmptyText>
      ) : (
        selectedDayEvents.map((event) => (
          <EventCard key={event.id} event={event} onPress={(eventId) => router.push(`/events/${eventId}`)} />
        ))
      )}
    </ScreenContainer>
  );
}
