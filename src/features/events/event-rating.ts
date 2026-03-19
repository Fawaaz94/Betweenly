export type EventRatingValue = 1 | 2 | 3 | 4 | 5;

export const EVENT_RATING_OPTIONS: ReadonlyArray<{ value: EventRatingValue; emoji: string; label: string }> = [
  { value: 1, emoji: '😖', label: 'Damn' },
  { value: 2, emoji: '😕', label: 'Uhmm' },
  { value: 3, emoji: '🤔', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Mmm' },
  { value: 5, emoji: '😍', label: 'OMG' },
];

export function toEventRatingValue(value: number | null | undefined): EventRatingValue {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value;
  if (typeof value !== 'number' || Number.isNaN(value)) return 3;
  if (value <= 1) return 1;
  if (value >= 5) return 5;
  return Math.round(value) as EventRatingValue;
}

export function getEventRatingOption(value: number | null | undefined) {
  const normalized = toEventRatingValue(value);
  return EVENT_RATING_OPTIONS.find((option) => option.value === normalized) ?? EVENT_RATING_OPTIONS[2];
}
