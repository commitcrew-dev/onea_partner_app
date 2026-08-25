import { create } from 'zustand';
import { DEFAULT_SETTINGS, settingsService } from '@/services/settings.service';
import type { AppSettings } from '@/types';

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,

  async hydrate() {
    set({ loading: true });
    try {
      const settings = await settingsService.get();
      set({ settings, loading: false });
    } catch {
      // Defaults are already in place; the UI stays usable.
      set({ loading: false });
    }
  },

  async update(patch) {
    // Applied optimistically so switches respond instantly to touch.
    const previous = get().settings;
    set({ settings: { ...previous, ...patch } });
    try {
      const settings = await settingsService.update(patch);
      set({ settings });
    } catch {
      set({ settings: previous });
    }
  },
}));
