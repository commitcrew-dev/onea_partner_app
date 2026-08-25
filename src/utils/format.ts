/** Formatting helpers. All money is INR and all dates are IST — as in the design. */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** `18500` → `₹18,500` — the format used on indent and payment rows. */
export function formatCurrency(amount: number): string {
  return INR.format(amount);
}

/** Signed variant for deductions, e.g. TDS renders as `-₹198`. */
export function formatSignedCurrency(amount: number): string {
  return amount < 0 ? `-${INR.format(Math.abs(amount))}` : INR.format(amount);
}

const SHORT_DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const LONG_DATE = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const DATE_TIME = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** `2026-07-05` → `Jul 5`, matching the indent card. */
export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(iso)).replace(/^(\d+)\s(\w+)$/, '$2 $1');
}

/** `2026-07-03` → `03/07/2026`, matching the trip detail rows. */
export function formatLongDate(iso: string): string {
  return LONG_DATE.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

/** "2 hours ago" / "Yesterday" for the notification list. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return SHORT_DATE.format(then);
}

/** `+919876554322` → `+91 9876554322`, as shown under the profile name. */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return `+91 ${local}`;
}

/** Groups a raw 10-digit entry as `98765 43210` for the login field. */
export function formatMobileInput(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)} ${clean.slice(5)}`;
}

export function formatWeight(ton: number): string {
  return `${ton} Ton`;
}

/** Builds the two-letter avatar fallback from a partner or driver name. */
export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
