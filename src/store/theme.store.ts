import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { storage, writeSync } from '@/services/storage.service';
import type { ThemeMode } from '@/types';

type Resolved = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  /** What is actually on screen once `system` is resolved against the OS. */
  resolved: Resolved;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => Promise<void>;
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function resolve(mode: ThemeMode): Resolved {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

/** Swaps the root class and the browser/OS chrome colour to match. */
function applyToDocument(resolved: Resolved): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#050511' : '#0A1028');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolved: 'light',

  setMode(mode) {
    const resolved = resolve(mode);
    applyToDocument(resolved);
    set({ mode, resolved });
    // Written synchronously too, so the pre-paint script in index.html sees it.
    writeSync(STORAGE_KEYS.theme, mode === 'system' ? resolved : mode);
    void storage.set(STORAGE_KEYS.theme, mode);
  },

  /** Drives the Dark Mode switch on the Profile screen. */
  toggle() {
    get().setMode(get().resolved === 'dark' ? 'light' : 'dark');
  },

  async hydrate() {
    const stored = await storage.get<ThemeMode>(STORAGE_KEYS.theme);
    const mode = stored ?? 'system';
    const resolved = resolve(mode);
    applyToDocument(resolved);
    set({ mode, resolved });
  },
}));

// Track the OS setting while the app is open, but only while following it.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { mode } = useThemeStore.getState();
    if (mode !== 'system') return;
    const resolved = resolve('system');
    applyToDocument(resolved);
    useThemeStore.setState({ resolved });
  });
}
