import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { APP_VERSION, STORAGE_KEYS } from '@/constants';
import { storage } from '@/services/storage.service';
import type { ApiFailure, AuthTokens } from '@/types';

interface RetriableConfig extends InternalAxiosRequestConfig {
  /** Guards against an infinite refresh loop when the refresh call itself 401s. */
  _retried?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.example.com',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 20000),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Version': APP_VERSION,
    'X-Client-Platform': 'partner-app',
  },
});

/* ------------------------------------------------------- session handling -- */

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler = () => {};

/** Registered once by the auth store so the interceptor can force a logout. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

/**
 * Concurrent 401s must trigger only one refresh. Followers await this promise
 * rather than firing their own refresh request.
 */
let refreshInFlight: Promise<AuthTokens | null> | null = null;

async function refreshTokens(): Promise<AuthTokens | null> {
  const current = await storage.get<AuthTokens>(STORAGE_KEYS.tokens);
  if (!current?.refreshToken) return null;

  try {
    // Bare axios: the shared instance would recurse through this interceptor.
    const { data } = await axios.post<{ data: AuthTokens }>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      { refreshToken: current.refreshToken },
      { timeout: apiClient.defaults.timeout },
    );
    await storage.set(STORAGE_KEYS.tokens, data.data);
    return data.data;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------- interceptors --- */

apiClient.interceptors.request.use(async (config) => {
  const tokens = await storage.get<AuthTokens>(STORAGE_KEYS.tokens);
  if (tokens?.accessToken) {
    config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ code?: string; message?: string }>) => {
    const config = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && config && !config._retried) {
      config._retried = true;

      refreshInFlight ??= refreshTokens().finally(() => {
        refreshInFlight = null;
      });
      const tokens = await refreshInFlight;

      if (tokens?.accessToken) {
        config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
        return apiClient(config);
      }

      await storage.remove(STORAGE_KEYS.tokens);
      onSessionExpired();
    }

    return Promise.reject(toApiFailure(error));
  },
);

/** Normalises every transport-level error into one shape the UI can render. */
export function toApiFailure(error: unknown): ApiFailure {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ code?: string; message?: string }>;

    if (err.code === 'ECONNABORTED') {
      return { status: 408, code: 'TIMEOUT', message: 'The request timed out. Please try again.' };
    }
    if (!err.response) {
      return {
        status: 0,
        code: 'NETWORK',
        message: 'No internet connection. Check your network and retry.',
      };
    }
    return {
      status: err.response.status,
      code: err.response.data?.code ?? 'HTTP_ERROR',
      message: err.response.data?.message ?? 'Something went wrong. Please try again.',
    };
  }

  if (error instanceof Error) {
    return { status: 0, code: 'UNKNOWN', message: error.message };
  }
  return { status: 0, code: 'UNKNOWN', message: 'Something went wrong. Please try again.' };
}
