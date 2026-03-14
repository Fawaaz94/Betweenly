import { toDateInput, toTimeInput } from './date';
import type { CreateEventInput, EventType } from '../types/models';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type LogEventFormValues = {
  eventType: EventType;
  partnerName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: string;
  location: string;
  overallRating: string;
  emotionalRating: string;
  notes: string;
  positions: string;
  toysUsed: string;
  whatWorkedWell: string;
  whatToTryNext: string;
  isSharedWithPartner: boolean;
};

type LogEventField = keyof LogEventFormValues | 'dateTime';

export type LogEventValidationIssue = {
  field: LogEventField;
  message: string;
};

export type LogEventValidationResult =
  | { success: true; data: CreateEventInput }
  | { success: false; issues: LogEventValidationIssue[] };

type ParsedDateTime = {
  localDateTime: string;
  date: Date;
};

export function createDefaultLogEventValues(isLinkedRelationship: boolean): LogEventFormValues {
  const now = new Date();

  return {
    eventType: 'partnered',
    partnerName: '',
    startDate: toDateInput(now),
    startTime: toTimeInput(now),
    endDate: '',
    endTime: '',
    durationMinutes: '45',
    location: 'Home',
    overallRating: '4',
    emotionalRating: '4',
    notes: '',
    positions: '',
    toysUsed: '',
    whatWorkedWell: '',
    whatToTryNext: '',
    isSharedWithPartner: isLinkedRelationship,
  };
}

function cleanText(value: string) {
  return value.trim();
}

function parseDateTimeParts(date: string, time: string): ParsedDateTime | null {
  const cleanDate = cleanText(date);
  const cleanTime = cleanText(time);

  if (!DATE_PATTERN.test(cleanDate) || !TIME_PATTERN.test(cleanTime)) return null;

  const localDateTime = `${cleanDate}T${cleanTime}:00`;
  const parsed = new Date(localDateTime);

  if (Number.isNaN(+parsed)) return null;
  if (toDateInput(parsed) !== cleanDate || toTimeInput(parsed) !== cleanTime) return null;

  return { localDateTime, date: parsed };
}

function parseRating(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : NaN;
}

function parseDurationMinutes(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : NaN;
}

export function validateLogEventForm(
  values: LogEventFormValues,
  options?: { ownerUserId?: string | null },
): LogEventValidationResult {
  const issues: LogEventValidationIssue[] = [];
  const partnerName = cleanText(values.partnerName);
  const location = cleanText(values.location);

  const start = parseDateTimeParts(values.startDate, values.startTime);
  if (!start) {
    issues.push({ field: 'startDate', message: 'Enter a valid start date and time.' });
  }

  const hasEndDate = cleanText(values.endDate).length > 0;
  const hasEndTime = cleanText(values.endTime).length > 0;
  let end: ParsedDateTime | null = null;

  if (hasEndDate || hasEndTime) {
    if (!hasEndDate || !hasEndTime) {
      issues.push({ field: 'dateTime', message: 'Provide both end date and end time, or leave both empty.' });
    } else {
      end = parseDateTimeParts(values.endDate, values.endTime);
      if (!end) {
        issues.push({ field: 'endDate', message: 'Enter a valid end date and time.' });
      }
    }
  }

  let durationMinutes = parseDurationMinutes(values.durationMinutes);
  if (!end && (!Number.isInteger(durationMinutes) || durationMinutes < 1)) {
    issues.push({ field: 'durationMinutes', message: 'Duration must be at least 1 minute when no end time is set.' });
  }

  if (start && end) {
    const calculatedDuration = Math.round((+end.date - +start.date) / 60_000);
    if (calculatedDuration < 1) {
      issues.push({ field: 'dateTime', message: 'End time must be after the start time.' });
    } else {
      durationMinutes = calculatedDuration;
    }
  }

  const overallRating = parseRating(values.overallRating);
  if (overallRating < 1 || overallRating > 5) {
    issues.push({ field: 'overallRating', message: 'Overall rating must be between 1 and 5.' });
  }

  const emotionalRating = parseRating(values.emotionalRating);
  if (emotionalRating < 1 || emotionalRating > 5) {
    issues.push({ field: 'emotionalRating', message: 'Emotional rating must be between 1 and 5.' });
  }

  if (!location) {
    issues.push({ field: 'location', message: 'Location is required.' });
  }

  if (values.eventType === 'partnered' && !partnerName) {
    issues.push({ field: 'partnerName', message: 'Partner name is required for partnered events.' });
  }

  if (!start || issues.length > 0) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      ownerUserId: cleanText(options?.ownerUserId ?? '') || 'local_user',
      eventType: values.eventType,
      partnerName: values.eventType === 'partnered' ? partnerName : null,
      dateTimeStart: start.localDateTime,
      dateTimeEnd: end?.localDateTime ?? null,
      durationMinutes,
      location,
      overallRating,
      emotionalRating,
      notes: cleanText(values.notes),
      positions: cleanText(values.positions),
      toysUsed: cleanText(values.toysUsed),
      whatWorkedWell: cleanText(values.whatWorkedWell),
      whatToTryNext: cleanText(values.whatToTryNext),
      isSharedWithPartner: values.isSharedWithPartner,
    },
  };
}
