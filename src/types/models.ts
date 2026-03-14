export type RelationshipMode = 'solo' | 'linked';

export type UserProfile = {
  email: string;
  displayName: string;
  relationshipMode: RelationshipMode;
  cycleTrackingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CycleData = {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  updatedAt: string;
};

export type EventType = 'solo' | 'partnered';

export type IntimacyEvent = {
  id: string;
  eventType: EventType;
  partnerDisplayNameSnapshot?: string;
  dateTimeStart: string;
  durationMinutes: number;
  location: string;
  overallRating: number;
  emotionalRating: number;
  notes: string;
  positions: string;
  whatWorkedWell: string;
  whatToTryNext: string;
  isSharedWithPartner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventInput = Omit<IntimacyEvent, 'id' | 'createdAt' | 'updatedAt'>;
