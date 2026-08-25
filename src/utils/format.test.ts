import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatMobile,
  formatMobileInput,
  formatRelative,
  formatShortDate,
  formatSignedCurrency,
  initialsOf,
} from './format';

describe('formatCurrency', () => {
  it('renders whole rupees in the Indian grouping used on indent cards', () => {
    expect(formatCurrency(18500)).toBe('₹18,500');
    expect(formatCurrency(1922000)).toBe('₹19,22,000');
  });

  it('drops paise so amounts stay compact', () => {
    expect(formatCurrency(19602.4)).toBe('₹19,602');
  });
});

describe('formatSignedCurrency', () => {
  it('prefixes the minus outside the symbol, matching the TDS row', () => {
    expect(formatSignedCurrency(-198)).toBe('-₹198');
  });

  it('leaves positive amounts unsigned', () => {
    expect(formatSignedCurrency(19602)).toBe('₹19,602');
  });
});

describe('formatShortDate', () => {
  it('renders as "Jul 5", the format on the indent card', () => {
    expect(formatShortDate('2026-07-05')).toBe('Jul 5');
  });
});

describe('formatMobile', () => {
  it('splits the +91 prefix from the local number', () => {
    expect(formatMobile('+919876554322')).toBe('+91 9876554322');
  });

  it('accepts a bare 10-digit number', () => {
    expect(formatMobile('9876554322')).toBe('+91 9876554322');
  });
});

describe('formatMobileInput', () => {
  it('groups digits as the partner types', () => {
    expect(formatMobileInput('9876554322')).toBe('98765 54322');
    expect(formatMobileInput('98765')).toBe('98765');
  });

  it('ignores non-digits and caps at ten digits', () => {
    expect(formatMobileInput('98-765 54322999')).toBe('98765 54322');
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-07-04T21:40:00+05:30');

  it('describes recent times in minutes', () => {
    expect(formatRelative('2026-07-04T21:20:00+05:30', now)).toBe('20 min ago');
  });

  it('describes the previous day as Yesterday', () => {
    expect(formatRelative('2026-07-03T21:00:00+05:30', now)).toBe('Yesterday');
  });
});

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('Suresh Kumar')).toBe('SK');
    expect(initialsOf('Anita George Mathew')).toBe('AG');
  });

  it('handles a single name', () => {
    expect(initialsOf('Murugan')).toBe('M');
  });
});
