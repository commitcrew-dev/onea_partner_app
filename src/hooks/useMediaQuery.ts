import { useEffect, useState } from 'react';
import { DESKTOP_BREAKPOINT } from '@/constants';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True at the width where the sidebar replaces the bottom tab bar. */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
}
