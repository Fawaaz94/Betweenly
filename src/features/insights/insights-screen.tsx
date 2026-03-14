import { TrendCard } from '../../components/charts/trend-card';
import { ScreenContainer, ScreenTitle, StatRow } from '../../components/ui/primitives';
import { useAppState } from '../app/app-context';

export function InsightsScreen() {
  const { events } = useAppState();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dayEvents = events.filter((event) => +new Date(event.dateTimeStart) >= +startOfToday);
  const weekEvents = events.filter((event) => +new Date(event.dateTimeStart) >= +startOfWeek);
  const monthEvents = events.filter((event) => +new Date(event.dateTimeStart) >= +startOfMonth);

  const averageDuration = events.length
    ? Math.round(events.reduce((sum, event) => sum + event.durationMinutes, 0) / events.length)
    : 0;

  const averageRating = events.length
    ? (
        events.reduce((sum, event) => sum + event.overallRating, 0) /
        Math.max(1, events.length)
      ).toFixed(1)
    : '0.0';

  const summary =
    events.length === 0
      ? 'Add events to unlock trend insights.'
      : `You logged ${events.length} total entries. Partnered: ${events.filter((event) => event.eventType === 'partnered').length}, solo: ${events.filter((event) => event.eventType === 'solo').length}.`;

  return (
    <ScreenContainer>
      <StatRow label="Entries today" value={String(dayEvents.length)} />
      <StatRow label="Entries this week" value={String(weekEvents.length)} />
      <StatRow label="Entries this month" value={String(monthEvents.length)} />
      <StatRow label="Avg duration" value={`${averageDuration} min`} />
      <StatRow label="Avg rating" value={`${averageRating} / 5`} />

      <TrendCard summary={summary} />
    </ScreenContainer>
  );
}
