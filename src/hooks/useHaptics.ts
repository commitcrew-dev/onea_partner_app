import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Tactile feedback for key interactions. Every call is fire-and-forget and
 * silently no-ops on platforms without a haptic engine (desktop, most browsers).
 */
export function useHaptics() {
  const impact = useCallback((style: ImpactStyle = ImpactStyle.Light) => {
    void Haptics.impact({ style }).catch(() => {});
  }, []);

  const success = useCallback(() => {
    void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  }, []);

  const error = useCallback(() => {
    void Haptics.notification({ type: NotificationType.Error }).catch(() => {});
  }, []);

  const selection = useCallback(() => {
    void Haptics.selectionChanged().catch(() => {});
  }, []);

  return { impact, success, error, selection };
}
