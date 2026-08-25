import { apiClient } from '@/api/client';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope, AppNotification } from '@/types';

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    if (USE_MOCKS) {
      const sorted = [...db.notifications].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      );
      return delay(sorted);
    }

    const { data } = await apiClient.get<ApiEnvelope<AppNotification[]>>('/notifications');
    return data.data;
  },

  async markRead(id: string): Promise<AppNotification> {
    if (USE_MOCKS) {
      const found = db.notifications.find((notification) => notification.id === id);
      if (!found) return fail(404, 'NOTIFICATION_NOT_FOUND', 'This notification is gone.');
      found.read = true;
      return delay(found, 120);
    }

    const { data } = await apiClient.patch<ApiEnvelope<AppNotification>>(
      `/notifications/${id}/read`,
    );
    return data.data;
  },

  async markAllRead(): Promise<AppNotification[]> {
    if (USE_MOCKS) {
      db.notifications.forEach((notification) => {
        notification.read = true;
      });
      return delay(db.notifications, 200);
    }

    const { data } = await apiClient.post<ApiEnvelope<AppNotification[]>>(
      '/notifications/read-all',
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCKS) {
      db.notifications = db.notifications.filter((notification) => notification.id !== id);
      await delay(null, 120);
      return;
    }

    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Registers the device for push. Wired to Capacitor PushNotifications in
   * `native.service.ts`; this call hands the FCM/APNs token to the backend.
   */
  async registerDevice(token: string, platform: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(null, 150);
      return;
    }

    await apiClient.post('/notifications/devices', { token, platform });
  },
};
