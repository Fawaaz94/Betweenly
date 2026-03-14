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
  ownerUserId: string;
  eventType: EventType;
  partnerName: string | null;
  dateTimeStart: string;
  dateTimeEnd: string | null;
  durationMinutes: number;
  location: string;
  overallRating: number;
  emotionalRating: number;
  notes: string;
  positions: string;
  toysUsed: string;
  whatWorkedWell: string;
  whatToTryNext: string;
  isSharedWithPartner?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntimacyEventInput = Omit<IntimacyEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateIntimacyEventInput = Partial<CreateIntimacyEventInput>;

export type CreateEventInput = CreateIntimacyEventInput;
export type UpdateEventInput = UpdateIntimacyEventInput;
