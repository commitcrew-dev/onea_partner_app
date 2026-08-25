import { apiClient } from '@/api/client';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope, Trip, TripStatus } from '@/types';

export type TripScope = 'ongoing' | 'completed';

const ONGOING: TripStatus[] = ['assigned', 'started', 'in-transit'];

export const tripService = {
  async list(scope: TripScope): Promise<Trip[]> {
    if (USE_MOCKS) {
      const filtered = db.trips.filter((trip) =>
        scope === 'ongoing' ? ONGOING.includes(trip.status) : !ONGOING.includes(trip.status),
      );
      const sorted = filtered.sort(
        (a, b) => new Date(b.loadingDate).getTime() - new Date(a.loadingDate).getTime(),
      );
      return delay(sorted);
    }

    const { data } = await apiClient.get<ApiEnvelope<{ items: Trip[] }>>('/trips', { params: { scope } });
    return data.data.items;
  },

  async detail(tripId: string): Promise<Trip> {
    if (USE_MOCKS) {
      const found = db.trips.find((trip) => trip.id === tripId);
      if (!found) return fail(404, 'TRIP_NOT_FOUND', 'We could not find this trip.');
      return delay(found);
    }

    const { data } = await apiClient.get<ApiEnvelope<Trip>>(`/trips/${tripId}`);
    return data.data;
  },

  /**
   * Advances a trip to the next status and stamps the matching timeline entry.
   * The partner can only move a trip forward; reverting is an ops-side action.
   */
  async advanceStatus(tripId: string, next: TripStatus): Promise<Trip> {
    if (USE_MOCKS) {
      const found = db.trips.find((trip) => trip.id === tripId);
      if (!found) return fail(404, 'TRIP_NOT_FOUND', 'We could not find this trip.');

      const targetIndex = found.timeline.findIndex((entry) => entry.status === next);
      if (targetIndex === -1) {
        return fail(400, 'INVALID_STATUS', 'That status does not apply to this trip.');
      }

      const now = new Date().toISOString();
      found.timeline.forEach((entry, index) => {
        if (index <= targetIndex && !entry.complete) {
          entry.complete = true;
          entry.at = now;
        }
      });
      found.status = next;

      if (next === 'delivered') {
        found.payment.balanceDue = 0;
        found.payment.advancePaid = found.payment.totalPayable;
      }

      return delay(found);
    }

    const { data } = await apiClient.patch<ApiEnvelope<Trip>>(`/trips/${tripId}/status`, {
      status: next,
    });
    return data.data;
  },
};
