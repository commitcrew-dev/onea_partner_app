import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { setSessionExpiredHandler } from '@/api/client';
import { authService } from '@/services/auth.service';
import { storage } from '@/services/storage.service';
import type { AuthStatus, AuthTokens, OtpChallenge, Partner } from '@/types';

interface AuthState {
  status: AuthStatus;
  partner: Partner | null;
  tokens: AuthTokens | null;
  challenge: OtpChallenge | null;
  /** Number the partner typed, kept across the login → OTP → error screens. */
  pendingMobile: string;
  /** False until the persisted session has been read, so guards can wait. */
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setChallenge: (challenge: OtpChallenge, mobile: string) => void;
  signIn: (tokens: AuthTokens, partner: Partner) => Promise<void>;
  setPartner: (partner: Partner) => void;
  signOut: () => Promise<void>;
  expireSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unauthenticated',
  partner: null,
  tokens: null,
  challenge: null,
  pendingMobile: '',
  hydrated: false,

  /** Restores a stored session on cold start — this is what enables auto-login. */
  async hydrate() {
    const [tokens, partner] = await Promise.all([
      storage.get<AuthTokens>(STORAGE_KEYS.tokens),
      storage.get<Partner>(STORAGE_KEYS.partner),
    ]);

    if (!tokens || !partner) {
      set({ hydrated: true, status: 'unauthenticated' });
      return;
    }

    if (tokens.expiresAt <= Date.now()) {
      await Promise.all([
        storage.remove(STORAGE_KEYS.tokens),
        storage.remove(STORAGE_KEYS.partner),
      ]);
      set({ hydrated: true, status: 'expired', tokens: null, partner: null });
      return;
    }

    set({ hydrated: true, status: 'authenticated', tokens, partner });
  },

  setChallenge(challenge, mobile) {
    set({ challenge, pendingMobile: mobile, status: 'authenticating' });
  },

  async signIn(tokens, partner) {
    await Promise.all([
      storage.set(STORAGE_KEYS.tokens, tokens),
      storage.set(STORAGE_KEYS.partner, partner),
    ]);
    set({ status: 'authenticated', tokens, partner, challenge: null, pendingMobile: '' });
  },

  setPartner(partner) {
    set({ partner });
    void storage.set(STORAGE_KEYS.partner, partner);
  },

  async signOut() {
    try {
      await authService.logout();
    } catch {
      // A failed server-side logout must never trap the partner in the app.
    }
    await Promise.all([
      storage.remove(STORAGE_KEYS.tokens),
      storage.remove(STORAGE_KEYS.partner),
    ]);
    set({
      status: 'unauthenticated',
      tokens: null,
      partner: null,
      challenge: null,
      pendingMobile: '',
    });
  },

  expireSession() {
    if (get().status === 'expired') return;
    set({ status: 'expired', tokens: null });
    void storage.remove(STORAGE_KEYS.tokens);
  },
}));

// Lets the axios interceptor drop the session when a refresh ultimately fails.
setSessionExpiredHandler(() => {
  useAuthStore.getState().expireSession();
});
