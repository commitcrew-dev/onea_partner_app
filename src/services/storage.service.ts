import { Preferences } from '@capacitor/preferences';

/**
 * Persistent key/value storage.
 *
 * Capacitor Preferences maps to SharedPreferences on Android and UserDefaults on
 * iOS; on the web it falls back to localStorage automatically. Every call is
 * async so the same code path works on all three platforms.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value === null ? null : (JSON.parse(value) as T);
    } catch {
      // Corrupted entry or storage denied (private browsing) — treat as absent.
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch {
      // Quota exceeded or storage denied. The app keeps working from memory.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch {
      // Nothing to do — the key is already unreachable.
    }
  },

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch {
      // Non-fatal: logout still clears the in-memory stores.
    }
  },
};

/**
 * Synchronous read used only by the pre-paint theme bootstrap, where an async
 * round-trip would let the wrong palette flash on screen.
 */
export function readSync<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeSync<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignored — Preferences remains the source of truth.
  }
}
