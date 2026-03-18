import type { ActivityIconName } from '../constants/activities';

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

export type Partner = {
  id: string;
  name: string;
  birthday: string | null;
  nationality: string;
  instagram: string;
  notes: string;
  phoneNumber: string;
  avatarUri: string | null;
  avatarAssetId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePartnerInput = Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePartnerInput = Partial<CreatePartnerInput>;

export type AppMedia = {
  id: string;
  uri: string;
  mediaType: 'image';
  sourceFilename: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppMediaInput = Omit<AppMedia, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAppMediaInput = Partial<CreateAppMediaInput>;

export type Activity = {
  id: string;
  name: string;
  icon: ActivityIconName;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateActivityInput = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActivityInput = Partial<CreateActivityInput>;
