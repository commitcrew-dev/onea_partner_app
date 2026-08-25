import { describe, expect, it } from 'vitest';
import { authService, normaliseMobile } from './auth.service';
import { DEMO_MOBILE, DEMO_OTP } from '@/constants';

describe('normaliseMobile', () => {
  it('strips spaces, dashes and a +91 prefix', () => {
    expect(normaliseMobile('+91 98765 54322')).toBe('9876554322');
    expect(normaliseMobile('98765-54322')).toBe('9876554322');
    expect(normaliseMobile('919876554322')).toBe('9876554322');
  });
});

describe('authService.verifyOtp', () => {
  it('signs in the demo partner with the right code', async () => {
    const challenge = await authService.requestOtp(DEMO_MOBILE);
    const outcome = await authService.verifyOtp(challenge.challengeId, DEMO_MOBILE, DEMO_OTP);

    expect(outcome.result).toBe('success');
    if (outcome.result === 'success') {
      expect(outcome.partner.mobile).toBe('+919876554322');
      expect(outcome.tokens.accessToken).toMatch(/^mock\.access\./);
      expect(outcome.tokens.expiresAt).toBeGreaterThan(Date.now());
    }
  });

  it('rejects a wrong code and reports remaining attempts', async () => {
    const challenge = await authService.requestOtp(DEMO_MOBILE);
    const outcome = await authService.verifyOtp(challenge.challengeId, DEMO_MOBILE, '000000');

    expect(outcome.result).toBe('invalid-otp');
    if (outcome.result === 'invalid-otp') {
      expect(outcome.attemptsRemaining).toBe(2);
    }
  });

  it('reports an unregistered number even when the code is right', async () => {
    const mobile = '9000000001';
    const challenge = await authService.requestOtp(mobile);
    const outcome = await authService.verifyOtp(challenge.challengeId, mobile, DEMO_OTP);

    expect(outcome.result).toBe('not-registered');
  });

  it('issues the same challenge shape regardless of registration', async () => {
    // The API must not leak which numbers have accounts.
    const known = await authService.requestOtp(DEMO_MOBILE);
    const unknown = await authService.requestOtp('9000000002');

    expect(Object.keys(known).sort()).toEqual(Object.keys(unknown).sort());
    expect(known.resendAfterSeconds).toBe(unknown.resendAfterSeconds);
  });
});
