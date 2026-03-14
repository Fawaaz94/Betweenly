import type { CycleData, IntimacyEvent } from '../types/models';

export function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return iso;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function createMonthMatrix(year: number, month: number): Array<Array<number | null>> {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function calculateStreak(events: IntimacyEvent[]) {
  if (events.length === 0) return 0;

  const uniqueDays = new Set(events.map((event) => event.dateTimeStart.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = toDateInput(cursor);
    if (!uniqueDays.has(key)) {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        if (uniqueDays.has(toDateInput(cursor))) {
          streak += 1;
          continue;
        }
      }
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getCyclePhase(cycleData: CycleData, date: Date) {
  const start = new Date(`${cycleData.lastPeriodStart}T00:00:00`);
  if (Number.isNaN(+start)) return 'Unknown';

  const diffDays = Math.floor((+date - +start) / (24 * 60 * 60 * 1000));
  const dayInCycle =
    ((diffDays % cycleData.averageCycleLength) + cycleData.averageCycleLength) % cycleData.averageCycleLength;

  if (dayInCycle < cycleData.averagePeriodLength) return 'Period';
  if (dayInCycle === cycleData.averageCycleLength - 14) return 'Ovulation estimate';
  if (dayInCycle >= cycleData.averageCycleLength - 16 && dayInCycle <= cycleData.averageCycleLength - 12) {
    return 'Fertile window';
  }

  return 'Non-fertile phase';
}
