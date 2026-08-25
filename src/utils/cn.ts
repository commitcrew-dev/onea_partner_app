type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Joins conditional class names. Kept dependency-free — the app never needs
 * Tailwind class *merging*, only conditional composition.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }

  return out.join(' ');
}
