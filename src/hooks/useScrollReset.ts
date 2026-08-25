import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Sends a scroll container back to the top whenever the route changes, so a
 * newly pushed screen never opens part-way down the previous screen's scroll.
 */
export function useScrollReset(ref: RefObject<HTMLElement | null>): void {
  const { pathname } = useLocation();

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, ref]);
}
