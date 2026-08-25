import { apiClient } from '@/api/client';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import { normaliseMobile } from '@/services/auth.service';
import type { ApiEnvelope, BankDetails, Partner } from '@/types';

export type ProfileUpdate = Partial<Pick<Partner, 'name' | 'company' | 'city'>>;

export const profileService = {
  async get(): Promise<Partner> {
    if (USE_MOCKS) return delay(db.partner);

    const { data } = await apiClient.get<ApiEnvelope<Partner>>('/profile');
    return data.data;
  },

  async update(patch: ProfileUpdate): Promise<Partner> {
    if (USE_MOCKS) {
      Object.assign(db.partner, patch);
      if (patch.name) {
        // Keep the avatar initials in step with the edited name.
        db.partner.initials = patch.name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? '')
          .join('');
      }
      return delay(db.partner);
    }

    const { data } = await apiClient.patch<ApiEnvelope<Partner>>('/profile', patch);
    return data.data;
  },

  async updateBank(patch: Partial<BankDetails>): Promise<Partner> {
    if (USE_MOCKS) {
      Object.assign(db.partner.bank, patch);
      return delay(db.partner);
    }

    const { data } = await apiClient.patch<ApiEnvelope<Partner>>('/profile/bank', patch);
    return data.data;
  },

  /**
   * Changing the login mobile is OTP-gated: this requests the challenge, and
   * `confirmMobileChange` completes it once the partner enters the code.
   */
  async requestMobileChange(mobile: string): Promise<{ challengeId: string }> {
    const normalised = normaliseMobile(mobile);

    if (USE_MOCKS) {
      if (normalised.length !== 10) {
        return fail(422, 'INVALID_MOBILE', 'Enter a valid 10-digit mobile number.');
      }
      return delay({ challengeId: `chl_mobile_${Date.now()}` });
    }

    const { data } = await apiClient.post<ApiEnvelope<{ challengeId: string }>>(
      '/profile/mobile/request',
      { mobile: normalised },
    );
    return data.data;
  },

  async confirmMobileChange(challengeId: string, mobile: string, otp: string): Promise<Partner> {
    if (USE_MOCKS) {
      if (otp.length !== 6) return fail(422, 'INVALID_OTP', 'Enter the 6-digit code.');
      db.partner.mobile = `+91${normaliseMobile(mobile)}`;
      return delay(db.partner);
    }

    const { data } = await apiClient.post<ApiEnvelope<Partner>>('/profile/mobile/confirm', {
      challengeId,
      mobile: normaliseMobile(mobile),
      otp,
    });
    return data.data;
  },
};
