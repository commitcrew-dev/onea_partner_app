import { Capacitor } from '@capacitor/core';

export type Platform = 'ios' | 'android' | 'web';

/**
 * Platform detection and mode classes.
 *
 * This replaces `setupIonicReact()`. Every visual component in this app is
 * custom-built to match the TripleA design, so the only thing Ionic contributed
 * was the `ios`/`md` root class and its safe-area variables — both reproduced
 * here for ~15 lines instead of 227 KB gzip. `@ionic/react` remains a
 * dependency so Ionic components can be adopted later without re-plumbing.
 */
export function detectPlatform(): Platform {
  if (Capacitor.isNativePlatform()) {
    const native = Capacitor.getPlatform();
    if (native === 'ios' || native === 'android') return native;
  }

  // On the web, follow the user agent so a browser on iOS still feels native.
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  // iPadOS 13+ reports as a Mac; a touch-capable Mac is really an iPad.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/.test(ua)) return 'android';

  return 'web';
}

/** Ionic-compatible design-language mode, so `.ios`/`.md` selectors still work. */
export function platformMode(platform: Platform): 'ios' | 'md' {
  return platform === 'android' ? 'md' : 'ios';
}

/**
 * Tags <html> with the platform so CSS can adapt, mirroring the classes Ionic
 * would have applied. Called once at startup.
 */
export function applyPlatformClasses(): Platform {
  const platform = detectPlatform();
  const root = document.documentElement;

  root.classList.remove('ios', 'md', 'plt-ios', 'plt-android', 'plt-web', 'plt-native');
  root.classList.add(platformMode(platform), `plt-${platform}`);

  if (Capacitor.isNativePlatform()) root.classList.add('plt-native');

  return platform;
}
