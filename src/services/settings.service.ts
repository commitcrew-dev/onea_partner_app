import { apiClient } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import { delay, USE_MOCKS } from '@/services/mock/db';
import { storage } from '@/services/storage.service';
import type { ApiEnvelope, AppSettings } from '@/types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  pushEnabled: true,
  biometricEnabled: false,
  tripAlerts: true,
  paymentAlerts: true,
};

export const settingsService = {
  /**
   * Settings live on the device so they apply before the first network call.
   * The real backend mirrors them per-account for multi-device consistency.
   */
  async get(): Promise<AppSettings> {
    const local = await storage.get<AppSettings>(STORAGE_KEYS.settings);
    if (USE_MOCKS) {
      return delay({ ...DEFAULT_SETTINGS, ...local }, 120);
    }

    const { data } = await apiClient.get<ApiEnvelope<AppSettings>>('/settings');
    return { ...DEFAULT_SETTINGS, ...local, ...data.data };
  },

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await storage.get<AppSettings>(STORAGE_KEYS.settings);
    const next = { ...DEFAULT_SETTINGS, ...current, ...patch };
    await storage.set(STORAGE_KEYS.settings, next);

    if (USE_MOCKS) return delay(next, 120);

    const { data } = await apiClient.patch<ApiEnvelope<AppSettings>>('/settings', patch);
    return data.data;
  },
};
