import { apiClient } from '@/api/client';
import { DEMO_MOBILE, DEMO_OTP, OTP_RESEND_SECONDS } from '@/constants';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope, AuthTokens, OtpChallenge, OtpVerifyOutcome, Partner } from '@/types';

/** Strips spaces, dashes and a leading +91 so comparisons are consistent. */
export function normaliseMobile(input: string): string {
  return input.replace(/[\s-]/g, '').replace(/^\+?91/, '');
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function issueTokens(): AuthTokens {
  const nonce = Math.random().toString(36).slice(2);
  return {
    accessToken: `mock.access.${nonce}`,
    refreshToken: `mock.refresh.${nonce}`,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export const authService = {
  /**
   * Requests an OTP for a mobile number.
   * The real endpoint returns the same challenge regardless of whether the
   * number is registered, so the app cannot be used to enumerate partners.
   */
  async requestOtp(mobile: string): Promise<OtpChallenge> {
    const normalised = normaliseMobile(mobile);

    if (USE_MOCKS) {
      return delay({
        challengeId: `chl_${Date.now()}`,
        mobile: normalised,
        resendAfterSeconds: OTP_RESEND_SECONDS,
        expiresInSeconds: 300,
      });
    }

    const { data } = await apiClient.post<ApiEnvelope<OtpChallenge>>('/auth/otp/request', {
      mobile: normalised,
    });
    return data.data;
  },

  /**
   * Verifies an OTP. Three outcomes are modelled, all of which the UI handles:
   * success, a wrong code, and a valid code for a number with no partner account.
   */
  async verifyOtp(
    challengeId: string,
    mobile: string,
    otp: string,
  ): Promise<OtpVerifyOutcome> {
    const normalised = normaliseMobile(mobile);

    if (USE_MOCKS) {
      if (otp !== DEMO_OTP) {
        return delay({ result: 'invalid-otp' as const, attemptsRemaining: 2 });
      }
      if (normalised !== DEMO_MOBILE) {
        return delay({ result: 'not-registered' as const, mobile: normalised });
      }
      return delay({
        result: 'success' as const,
        tokens: issueTokens(),
        partner: db.partner,
      });
    }

    const { data } = await apiClient.post<ApiEnvelope<OtpVerifyOutcome>>('/auth/otp/verify', {
      challengeId,
      mobile: normalised,
      otp,
    });
    return data.data;
  },

  async resendOtp(challengeId: string, mobile: string): Promise<OtpChallenge> {
    if (USE_MOCKS) {
      return delay({
        challengeId,
        mobile: normaliseMobile(mobile),
        resendAfterSeconds: OTP_RESEND_SECONDS,
        expiresInSeconds: 300,
      });
    }

    const { data } = await apiClient.post<ApiEnvelope<OtpChallenge>>('/auth/otp/resend', {
      challengeId,
      mobile: normaliseMobile(mobile),
    });
    return data.data;
  },

  /** Exchanges a refresh token for a new pair. Mirrors the interceptor's call. */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (USE_MOCKS) {
      if (!refreshToken) return fail(401, 'INVALID_REFRESH', 'Session expired.');
      return delay(issueTokens(), 200);
    }

    const { data } = await apiClient.post<ApiEnvelope<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return data.data;
  },

  /** Returns the signed-in partner, used to re-hydrate a restored session. */
  async me(): Promise<Partner> {
    if (USE_MOCKS) return delay(db.partner, 200);

    const { data } = await apiClient.get<ApiEnvelope<Partner>>('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    if (USE_MOCKS) {
      await delay(null, 150);
      return;
    }
    await apiClient.post('/auth/logout');
  },
};
