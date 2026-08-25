import { apiClient } from '@/api/client';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope, NewTruckInput, Truck, TruckStatus } from '@/types';

/** Normalises `tn09cd1290` / `TN 09 CD 1290` to the canonical `TN-09-CD-1290`. */
export function formatRegistration(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = compact.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (!match) return input.toUpperCase().trim();
  return [match[1], match[2], match[3], match[4]].filter(Boolean).join('-');
}

export const truckService = {
  async list(): Promise<Truck[]> {
    if (USE_MOCKS) {
      // Trucks awaiting a load matter most to the partner, so they sort first.
      const order: Record<TruckStatus, number> = {
        'waiting-for-load': 0,
        'on-trip': 1,
        unloading: 2,
        maintenance: 3,
      };
      const sorted = [...db.trucks].sort(
        (a, b) =>
          order[a.status] - order[b.status] ||
          a.registrationNumber.localeCompare(b.registrationNumber),
      );
      return delay(sorted);
    }

    const { data } = await apiClient.get<ApiEnvelope<Truck[]>>('/trucks');
    // Real API returns items array wrapped in data
    const payload = data.data as unknown;
    return Array.isArray(payload) ? (payload as Truck[]) : (payload as { items: Truck[] }).items;
  },

  async detail(truckId: string): Promise<Truck> {
    if (USE_MOCKS) {
      const found = db.trucks.find((truck) => truck.id === truckId);
      if (!found) return fail(404, 'TRUCK_NOT_FOUND', 'We could not find this truck.');
      return delay(found);
    }

    const { data } = await apiClient.get<ApiEnvelope<Truck>>(`/trucks/${truckId}`);
    return data.data;
  },

  async create(input: NewTruckInput): Promise<Truck> {
    if (USE_MOCKS) {
      const registrationNumber = formatRegistration(input.registrationNumber);
      const duplicate = db.trucks.some(
        (truck) => truck.registrationNumber === registrationNumber,
      );
      if (duplicate) {
        return fail(409, 'TRUCK_EXISTS', 'A truck with this registration is already added.');
      }

      const truck: Truck = {
        ...input,
        registrationNumber,
        id: `trk_${registrationNumber.replace(/-/g, '').slice(-4).toLowerCase()}`,
        status: 'waiting-for-load',
        lastTripAt: new Date().toISOString(),
        // Documents start pending until the ops team verifies the uploads.
        documents: [
          { id: 'rc', label: 'RC Book', status: 'pending' },
          { id: 'ins', label: 'Insurance', status: 'pending' },
          { id: 'permit', label: 'National Permit', status: 'pending' },
          { id: 'fit', label: 'Fitness Certificate', status: 'pending' },
        ],
      };
      db.trucks.unshift(truck);
      return delay(truck);
    }

    const { data } = await apiClient.post<ApiEnvelope<Truck>>('/trucks', input);
    return data.data;
  },

  async updateStatus(truckId: string, status: TruckStatus): Promise<Truck> {
    if (USE_MOCKS) {
      const found = db.trucks.find((truck) => truck.id === truckId);
      if (!found) return fail(404, 'TRUCK_NOT_FOUND', 'We could not find this truck.');
      found.status = status;
      if (status !== 'on-trip') delete found.currentTripReference;
      return delay(found);
    }

    const { data } = await apiClient.patch<ApiEnvelope<Truck>>(`/trucks/${truckId}/status`, {
      status,
    });
    return data.data;
  },
};
