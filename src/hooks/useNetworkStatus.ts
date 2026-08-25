import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

/**
 * Connectivity, sourced from Capacitor Network on device and the browser's
 * online/offline events on the web. Drives the offline banner and retry states.
 */
export function useNetworkStatus(): { online: boolean } {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void Network.getStatus().then((status) => {
      if (!cancelled) setOnline(status.connected);
    });

    void Network.addListener('networkStatusChange', (status) => {
      setOnline(status.connected);
    }).then((handle) => {
      if (cancelled) {
        void handle.remove();
      } else {
        removeListener = () => void handle.remove();
      }
    });

    // The browser events are what actually fire on the web build.
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      removeListener?.();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online };
}
