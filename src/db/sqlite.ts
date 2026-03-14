import * as SQLite from 'expo-sqlite';
import { defaultThemeMode, type ThemeMode } from '../constants/theme';
import { toDateInput } from '../lib/date';
import type {
  CreateEventInput,
  CycleData,
  IntimacyEvent,
  UpdateEventInput,
  UserProfile,
} from '../types/models';

const dbPromise = SQLite.openDatabaseAsync('betweenly.db');

export const DEFAULT_CYCLE_DATA: CycleData = {
  lastPeriodStart: toDateInput(new Date()),
  averageCycleLength: 28,
  averagePeriodLength: 5,
  updatedAt: new Date().toISOString(),
};

const VALID_THEME_MODES: ThemeMode[] = ['light', 'dark'];

type IntimacyEventRow = {
  id: string;
  owner_user_id: string | null;
  event_type: 'solo' | 'partnered';
  partner_name: string | null;
  partner_display_name_snapshot: string | null;
  date_time_start: string;
  date_time_end: string | null;
  duration_minutes: number;
  location: string | null;
  overall_rating: number;
  emotional_rating: number;
  notes: string | null;
  positions: string | null;
  toys_used: string | null;
  what_worked_well: string | null;
  what_to_try_next: string | null;
  is_shared_with_partner: number | null;
  created_at: string;
  updated_at: string;
};

function asBool(value: number) {
  return value === 1;
}

function toBoolInt(value: boolean) {
  return value ? 1 : 0;
}

function cleanText(value: string | null | undefined) {
  return (value ?? '').trim();
}

function nullableCleanText(value: string | null | undefined) {
  const trimmed = cleanText(value);
  return trimmed.length > 0 ? trimmed : null;
}

function inferDateTimeEnd(dateTimeStart: string, durationMinutes: number) {
  const start = new Date(dateTimeStart);
  if (Number.isNaN(+start)) return dateTimeStart;

  const end = new Date(start.getTime() + Math.max(durationMinutes, 0) * 60_000);
  return end.toISOString();
}

function mapIntimacyEventRow(row: IntimacyEventRow): IntimacyEvent {
  const partnerName = nullableCleanText(row.partner_name) ?? nullableCleanText(row.partner_display_name_snapshot);

  return {
    id: row.id,
    ownerUserId: cleanText(row.owner_user_id) || 'local_user',
    eventType: row.event_type,
    partnerName,
    dateTimeStart: row.date_time_start,
    dateTimeEnd: nullableCleanText(row.date_time_end) ?? inferDateTimeEnd(row.date_time_start, row.duration_minutes),
    durationMinutes: row.duration_minutes,
    location: cleanText(row.location),
    overallRating: row.overall_rating,
    emotionalRating: row.emotional_rating,
    notes: cleanText(row.notes),
    positions: cleanText(row.positions),
    toysUsed: cleanText(row.toys_used),
    whatWorkedWell: cleanText(row.what_worked_well),
    whatToTryNext: cleanText(row.what_to_try_next),
    isSharedWithPartner: row.is_shared_with_partner === null ? undefined : asBool(row.is_shared_with_partner),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function addColumnIfMissing(db: SQLite.SQLiteDatabase, existingColumns: Set<string>, name: string, sql: string) {
  if (existingColumns.has(name)) return;

  await db.execAsync(sql);
  existingColumns.add(name);
}

async function ensureIntimacyEventColumns(db: SQLite.SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(intimacy_events)`);

  if (columns.length === 0) return;

  const columnNames = new Set(columns.map((column) => column.name));

  await addColumnIfMissing(
    db,
    columnNames,
    'owner_user_id',
    `ALTER TABLE intimacy_events ADD COLUMN owner_user_id TEXT DEFAULT 'local_user'`,
  );
  await addColumnIfMissing(
    db,
    columnNames,
    'partner_name',
    `ALTER TABLE intimacy_events ADD COLUMN partner_name TEXT`,
  );
  await addColumnIfMissing(
    db,
    columnNames,
    'date_time_end',
    `ALTER TABLE intimacy_events ADD COLUMN date_time_end TEXT`,
  );
  await addColumnIfMissing(
    db,
    columnNames,
    'toys_used',
    `ALTER TABLE intimacy_events ADD COLUMN toys_used TEXT NOT NULL DEFAULT ''`,
  );
  await addColumnIfMissing(
    db,
    columnNames,
    'partner_display_name_snapshot',
    `ALTER TABLE intimacy_events ADD COLUMN partner_display_name_snapshot TEXT`,
  );
  await addColumnIfMissing(
    db,
    columnNames,
    'is_shared_with_partner',
    `ALTER TABLE intimacy_events ADD COLUMN is_shared_with_partner INTEGER NOT NULL DEFAULT 0`,
  );

  await db.execAsync(`
    UPDATE intimacy_events
    SET
      owner_user_id = COALESCE(NULLIF(TRIM(owner_user_id), ''), 'local_user'),
      date_time_end = COALESCE(NULLIF(date_time_end, ''), date_time_start),
      toys_used = COALESCE(toys_used, ''),
      notes = COALESCE(notes, ''),
      positions = COALESCE(positions, ''),
      what_worked_well = COALESCE(what_worked_well, ''),
      what_to_try_next = COALESCE(what_to_try_next, ''),
      location = COALESCE(location, ''),
      is_shared_with_partner = COALESCE(is_shared_with_partner, 0)
  `);

  if (columnNames.has('partner_display_name_snapshot')) {
    await db.execAsync(`
      UPDATE intimacy_events
      SET partner_name = COALESCE(NULLIF(TRIM(partner_name), ''), NULLIF(TRIM(partner_display_name_snapshot), ''))
      WHERE partner_name IS NULL OR TRIM(partner_name) = ''
    `);
  }
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
      owner_user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      partner_name TEXT,
      partner_display_name_snapshot TEXT,
      date_time_start TEXT NOT NULL,
      date_time_end TEXT,
      duration_minutes INTEGER NOT NULL,
      location TEXT NOT NULL,
      overall_rating INTEGER NOT NULL,
      emotional_rating INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      positions TEXT NOT NULL DEFAULT '',
      toys_used TEXT NOT NULL DEFAULT '',
      what_worked_well TEXT NOT NULL DEFAULT '',
      what_to_try_next TEXT NOT NULL DEFAULT '',
      is_shared_with_partner INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
      theme_mode TEXT NOT NULL DEFAULT 'dark',
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_intimacy_events_start ON intimacy_events(date_time_start DESC);
  `);

  await ensureIntimacyEventColumns(db);
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

export async function upsertCycleData(cycleData: Omit<CycleData, 'updatedAt'> | CycleData): Promise<CycleData> {
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
    [cycleData.lastPeriodStart, cycleData.averageCycleLength, cycleData.averagePeriodLength, now],
  );

  return {
    lastPeriodStart: cycleData.lastPeriodStart,
    averageCycleLength: cycleData.averageCycleLength,
    averagePeriodLength: cycleData.averagePeriodLength,
    updatedAt: now,
  };
}

export async function createIntimacyEvent(input: CreateEventInput): Promise<IntimacyEvent> {
  const db = await dbPromise;
  const now = new Date().toISOString();
  const id = `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const ownerUserId = cleanText(input.ownerUserId) || 'local_user';
  const partnerName = nullableCleanText(input.partnerName);
  const dateTimeEnd = nullableCleanText(input.dateTimeEnd) ?? inferDateTimeEnd(input.dateTimeStart, input.durationMinutes);
  const location = cleanText(input.location);
  const notes = cleanText(input.notes);
  const positions = cleanText(input.positions);
  const toysUsed = cleanText(input.toysUsed);
  const whatWorkedWell = cleanText(input.whatWorkedWell);
  const whatToTryNext = cleanText(input.whatToTryNext);
  const isSharedWithPartner = Boolean(input.isSharedWithPartner);

  await db.runAsync(
    `INSERT INTO intimacy_events (
      id, owner_user_id, event_type, partner_name, partner_display_name_snapshot,
      date_time_start, date_time_end, duration_minutes, location, overall_rating,
      emotional_rating, notes, positions, toys_used, what_worked_well,
      what_to_try_next, is_shared_with_partner, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      ownerUserId,
      input.eventType,
      partnerName,
      partnerName,
      input.dateTimeStart,
      dateTimeEnd,
      input.durationMinutes,
      location,
      input.overallRating,
      input.emotionalRating,
      notes,
      positions,
      toysUsed,
      whatWorkedWell,
      whatToTryNext,
      toBoolInt(isSharedWithPartner),
      now,
      now,
    ],
  );

  return {
    id,
    ownerUserId,
    eventType: input.eventType,
    partnerName,
    dateTimeStart: input.dateTimeStart,
    dateTimeEnd,
    durationMinutes: input.durationMinutes,
    location,
    overallRating: input.overallRating,
    emotionalRating: input.emotionalRating,
    notes,
    positions,
    toysUsed,
    whatWorkedWell,
    whatToTryNext,
    isSharedWithPartner,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listIntimacyEvents(): Promise<IntimacyEvent[]> {
  const db = await dbPromise;
  const rows = await db.getAllAsync<IntimacyEventRow>(
    `SELECT
      id,
      owner_user_id,
      event_type,
      partner_name,
      partner_display_name_snapshot,
      date_time_start,
      date_time_end,
      duration_minutes,
      location,
      overall_rating,
      emotional_rating,
      notes,
      positions,
      toys_used,
      what_worked_well,
      what_to_try_next,
      is_shared_with_partner,
      created_at,
      updated_at
     FROM intimacy_events
     ORDER BY date_time_start DESC, created_at DESC`,
  );

  return rows.map(mapIntimacyEventRow);
}

export async function getIntimacyEventById(id: string): Promise<IntimacyEvent | null> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<IntimacyEventRow>(
    `SELECT
      id,
      owner_user_id,
      event_type,
      partner_name,
      partner_display_name_snapshot,
      date_time_start,
      date_time_end,
      duration_minutes,
      location,
      overall_rating,
      emotional_rating,
      notes,
      positions,
      toys_used,
      what_worked_well,
      what_to_try_next,
      is_shared_with_partner,
      created_at,
      updated_at
     FROM intimacy_events
     WHERE id = ?`,
    [id],
  );

  if (!row) return null;
  return mapIntimacyEventRow(row);
}

export async function updateIntimacyEvent(id: string, updates: UpdateEventInput): Promise<IntimacyEvent | null> {
  const db = await dbPromise;
  const existing = await getIntimacyEventById(id);

  if (!existing) return null;

  const now = new Date().toISOString();

  const next: IntimacyEvent = {
    ...existing,
    ...updates,
    ownerUserId: updates.ownerUserId ? cleanText(updates.ownerUserId) : existing.ownerUserId,
    partnerName: updates.partnerName === undefined ? existing.partnerName : nullableCleanText(updates.partnerName),
    location: updates.location === undefined ? existing.location : cleanText(updates.location),
    notes: updates.notes === undefined ? existing.notes : cleanText(updates.notes),
    positions: updates.positions === undefined ? existing.positions : cleanText(updates.positions),
    toysUsed: updates.toysUsed === undefined ? existing.toysUsed : cleanText(updates.toysUsed),
    whatWorkedWell:
      updates.whatWorkedWell === undefined ? existing.whatWorkedWell : cleanText(updates.whatWorkedWell),
    whatToTryNext: updates.whatToTryNext === undefined ? existing.whatToTryNext : cleanText(updates.whatToTryNext),
    dateTimeEnd:
      updates.dateTimeEnd === undefined
        ? existing.dateTimeEnd
        : nullableCleanText(updates.dateTimeEnd) ?? inferDateTimeEnd(existing.dateTimeStart, existing.durationMinutes),
    updatedAt: now,
  };

  await db.runAsync(
    `UPDATE intimacy_events
     SET
      owner_user_id = ?,
      event_type = ?,
      partner_name = ?,
      partner_display_name_snapshot = ?,
      date_time_start = ?,
      date_time_end = ?,
      duration_minutes = ?,
      location = ?,
      overall_rating = ?,
      emotional_rating = ?,
      notes = ?,
      positions = ?,
      toys_used = ?,
      what_worked_well = ?,
      what_to_try_next = ?,
      is_shared_with_partner = ?,
      updated_at = ?
     WHERE id = ?`,
    [
      next.ownerUserId,
      next.eventType,
      next.partnerName,
      next.partnerName,
      next.dateTimeStart,
      next.dateTimeEnd,
      next.durationMinutes,
      next.location,
      next.overallRating,
      next.emotionalRating,
      next.notes,
      next.positions,
      next.toysUsed,
      next.whatWorkedWell,
      next.whatToTryNext,
      toBoolInt(Boolean(next.isSharedWithPartner)),
      now,
      id,
    ],
  );

  return next;
}

export async function deleteIntimacyEvent(id: string) {
  const db = await dbPromise;
  await db.runAsync(`DELETE FROM intimacy_events WHERE id = ?`, [id]);
}

export async function listEventsDesc(): Promise<IntimacyEvent[]> {
  return listIntimacyEvents();
}

export async function insertEvent(input: CreateEventInput): Promise<IntimacyEvent> {
  return createIntimacyEvent(input);
}

export async function deleteEvent(id: string) {
  await deleteIntimacyEvent(id);
}

export async function getThemeMode(): Promise<ThemeMode> {
  const db = await dbPromise;
  const row = await db.getFirstAsync<{ theme_mode: string }>(
    `SELECT theme_mode FROM app_settings WHERE singleton_id = 1`,
  );

  if (!row || !VALID_THEME_MODES.includes(row.theme_mode as ThemeMode)) {
    await upsertThemeMode(defaultThemeMode);
    return defaultThemeMode;
  }

  return row.theme_mode as ThemeMode;
}

export async function upsertThemeMode(themeMode: ThemeMode): Promise<ThemeMode> {
  const db = await dbPromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO app_settings (singleton_id, theme_mode, updated_at)
     VALUES (1, ?, ?)
     ON CONFLICT(singleton_id) DO UPDATE SET
       theme_mode = excluded.theme_mode,
       updated_at = excluded.updated_at`,
    [themeMode, now],
  );

  return themeMode;
}
