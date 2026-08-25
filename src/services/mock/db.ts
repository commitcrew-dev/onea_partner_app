import indentsSeed from '@/mocks/indents.json';
import tripsSeed from '@/mocks/trips.json';
import trucksSeed from '@/mocks/trucks.json';
import partnerSeed from '@/mocks/partner.json';
import notificationsSeed from '@/mocks/notifications.json';
import type { AppNotification, Indent, Partner, Trip, Truck } from '@/types';

/**
 * In-memory mock backend.
 *
 * Seeded from the JSON fixtures and mutated by the service layer so that
 * accepting an indent, marking a notification read or adding a truck all behave
 * like a real server for the lifetime of the session.
 */
interface MockDatabase {
  indents: Indent[];
  trips: Trip[];
  trucks: Truck[];
  partner: Partner;
  notifications: AppNotification[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const db: MockDatabase = {
  indents: clone(indentsSeed as Indent[]),
  trips: clone(tripsSeed as Trip[]),
  trucks: clone(trucksSeed as Truck[]),
  partner: clone(partnerSeed as Partner),
  notifications: clone(notificationsSeed as AppNotification[]),
};

/** Restores every table to its seeded state. Used between tests. */
export function resetDb(): void {
  db.indents = clone(indentsSeed as Indent[]);
  db.trips = clone(tripsSeed as Trip[]);
  db.trucks = clone(trucksSeed as Truck[]);
  db.partner = clone(partnerSeed as Partner);
  db.notifications = clone(notificationsSeed as AppNotification[]);
}

const MOCK_LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? 450);

/** Simulates network latency so skeletons and loading states are exercised. */
export function delay<T>(value: T, ms: number = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(value)), ms);
  });
}

/** Rejects with the same `ApiFailure` shape the axios interceptor produces. */
export function fail(status: number, code: string, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject({ status, code, message }), MOCK_LATENCY);
  });
}

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
