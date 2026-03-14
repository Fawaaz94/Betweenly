import * as SQLite from 'expo-sqlite';
import { toDateInput } from '../lib/date';
import type { CreateEventInput, CycleData, IntimacyEvent, UserProfile } from '../types/models';

const dbPromise = SQLite.openDatabaseAsync('betweenly.db');

export const DEFAULT_CYCLE_DATA: CycleData = {
  lastPeriodStart: toDateInput(new Date()),
  averageCycleLength: 28,
  averagePeriodLength: 5,
  updatedAt: new Date().toISOString(),
};

function asBool(value: number) {
  return value === 1;
}

function toBoolInt(value: boolean) {
  return value ? 1 : 0;
}

export async function initDb() {
  const db = await dbPromise;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      relationship_mode TEXT NOT NULL,
      cycle_tracking_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cycle_data (
      singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
      last_period_start TEXT NOT NULL,
      average_cycle_length INTEGER NOT NULL,
      average_period_length INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS intimacy_events (
      id TEXT PRIMARY KEY NOT NULL,
      event_type TEXT NOT NULL,
      partner_display_name_snapshot TEXT,
      date_time_start TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      location TEXT NOT NULL,
      overall_rating INTEGER NOT NULL,
      emotional_rating INTEGER NOT NULL,
      notes TEXT NOT NULL,
      positions TEXT NOT NULL,
      what_worked_well TEXT NOT NULL,
      what_to_try_next TEXT NOT NULL,
      is_shared_with_partner INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_intimacy_events_start ON intimacy_events(date_time_start DESC);
  `);
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{
    email: string;
    display_name: string;
    relationship_mode: 'solo' | 'linked';
    cycle_tracking_enabled: number;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT email, display_name, relationship_mode, cycle_tracking_enabled, created_at, updated_at
     FROM user_profile WHERE singleton_id = 1`,
  );

  if (!row) return null;

  return {
    email: row.email,
    displayName: row.display_name,
    relationshipMode: row.relationship_mode,
    cycleTrackingEnabled: asBool(row.cycle_tracking_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  const db = await dbPromise;
  const now = new Date().toISOString();
  const existing = await getUserProfile();
  const createdAt = existing?.createdAt ?? now;

  await db.runAsync(
    `INSERT INTO user_profile (
      singleton_id, email, display_name, relationship_mode, cycle_tracking_enabled, created_at, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(singleton_id) DO UPDATE SET
      email = excluded.email,
      display_name = excluded.display_name,
      relationship_mode = excluded.relationship_mode,
      cycle_tracking_enabled = excluded.cycle_tracking_enabled,
      updated_at = excluded.updated_at`,
    [
      profile.email,
      profile.displayName,
      profile.relationshipMode,
      toBoolInt(profile.cycleTrackingEnabled),
      createdAt,
      now,
    ],
  );

  return {
    ...profile,
    createdAt,
    updatedAt: now,
  };
}

export async function getCycleData(): Promise<CycleData> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{
    last_period_start: string;
    average_cycle_length: number;
    average_period_length: number;
    updated_at: string;
  }>(
    `SELECT last_period_start, average_cycle_length, average_period_length, updated_at
     FROM cycle_data WHERE singleton_id = 1`,
  );

  if (!row) {
    await upsertCycleData(DEFAULT_CYCLE_DATA);
    return DEFAULT_CYCLE_DATA;
  }

  return {
    lastPeriodStart: row.last_period_start,
    averageCycleLength: row.average_cycle_length,
    averagePeriodLength: row.average_period_length,
    updatedAt: row.updated_at,
  };
}

export async function upsertCycleData(
  cycleData: Omit<CycleData, 'updatedAt'> | CycleData,
): Promise<CycleData> {
  const db = await dbPromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO cycle_data (
      singleton_id, last_period_start, average_cycle_length, average_period_length, updated_at
    ) VALUES (1, ?, ?, ?, ?)
    ON CONFLICT(singleton_id) DO UPDATE SET
      last_period_start = excluded.last_period_start,
      average_cycle_length = excluded.average_cycle_length,
      average_period_length = excluded.average_period_length,
      updated_at = excluded.updated_at`,
    [
      cycleData.lastPeriodStart,
      cycleData.averageCycleLength,
      cycleData.averagePeriodLength,
      now,
    ],
  );

  return {
    lastPeriodStart: cycleData.lastPeriodStart,
    averageCycleLength: cycleData.averageCycleLength,
    averagePeriodLength: cycleData.averagePeriodLength,
    updatedAt: now,
  };
}

export async function listEventsDesc(): Promise<IntimacyEvent[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<{
    id: string;
    event_type: 'solo' | 'partnered';
    partner_display_name_snapshot: string | null;
    date_time_start: string;
    duration_minutes: number;
    location: string;
    overall_rating: number;
    emotional_rating: number;
    notes: string;
    positions: string;
    what_worked_well: string;
    what_to_try_next: string;
    is_shared_with_partner: number;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT * FROM intimacy_events ORDER BY date_time_start DESC, created_at DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    partnerDisplayNameSnapshot: row.partner_display_name_snapshot ?? undefined,
    dateTimeStart: row.date_time_start,
    durationMinutes: row.duration_minutes,
    location: row.location,
    overallRating: row.overall_rating,
    emotionalRating: row.emotional_rating,
    notes: row.notes,
    positions: row.positions,
    whatWorkedWell: row.what_worked_well,
    whatToTryNext: row.what_to_try_next,
    isSharedWithPartner: asBool(row.is_shared_with_partner),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function insertEvent(input: CreateEventInput): Promise<IntimacyEvent> {
  const db = await dbPromise;
  const now = new Date().toISOString();
  const id = `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  await db.runAsync(
    `INSERT INTO intimacy_events (
      id, event_type, partner_display_name_snapshot, date_time_start, duration_minutes,
      location, overall_rating, emotional_rating, notes, positions,
      what_worked_well, what_to_try_next, is_shared_with_partner, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.eventType,
      input.partnerDisplayNameSnapshot ?? null,
      input.dateTimeStart,
      input.durationMinutes,
      input.location,
      input.overallRating,
      input.emotionalRating,
      input.notes,
      input.positions,
      input.whatWorkedWell,
      input.whatToTryNext,
      toBoolInt(input.isSharedWithPartner),
      now,
      now,
    ],
  );

  return {
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}

export async function deleteEvent(id: string) {
  const db = await dbPromise;
  await db.runAsync(`DELETE FROM intimacy_events WHERE id = ?`, [id]);
}
