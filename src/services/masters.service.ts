import { apiClient } from '@/api/client';
import { CITIES } from '@/constants';
import { delay, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope } from '@/types';

/**
 * Master data served read-only by the partner API. Branches group cities into
 * regions and back the "City / Route" filter chip; the response is small
 * enough to cache in react-query for 30 minutes.
 */
export const mastersService = {
  async branches(search?: string): Promise<string[]> {
    if (USE_MOCKS) {
      // In mock mode we reuse the city list as a stand-in for branches.
      const list = search
        ? CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
        : [...CITIES];
      return delay(list, 120);
    }
    const { data } = await apiClient.get<ApiEnvelope<string[]>>('/masters/branches', {
      params: search ? { search } : undefined,
    });
    return data.data;
  },
};
