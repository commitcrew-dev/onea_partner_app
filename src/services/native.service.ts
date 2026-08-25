import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { notificationService } from './notification.service';

const isNative = Capacitor.isNativePlatform();

/**
 * Configures the status bar to sit on the navy header.
 * `Style.Dark` means light content on a dark background.
 */
export async function configureStatusBar(): Promise<void> {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0A1028' });
    }
  } catch {
    // Unsupported on this device — the web meta theme-color still applies.
  }
}

/** Keeps the keyboard from covering pinned footer buttons on iOS. */
export async function configureKeyboard(): Promise<void> {
  if (!isNative) return;
  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {
    // Android has no accessory bar.
  }
}

/**
 * Requests push permission and registers the device token with the backend.
 * Returns false when the partner declines, so Settings can explain why.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!isNative) {
    // On the web, fall back to the Notifications API where it exists.
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  try {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === 'prompt') {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== 'granted') return false;

    await PushNotifications.register();
    return true;
  } catch {
    return false;
  }
}

type DeepLinkHandler = (path: string) => void;

/**
 * Wires the native listeners: push registration, notification taps, deep links
 * and the Android hardware back button. Returns a cleanup function.
 */
export async function initNativeListeners(onDeepLink: DeepLinkHandler): Promise<() => void> {
  if (!isNative) return () => {};

  const handles = await Promise.all([
    PushNotifications.addListener('registration', (token) => {
      void notificationService.registerDevice(token.value, Capacitor.getPlatform());
    }),

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const link = action.notification.data?.link;
      if (typeof link === 'string') onDeepLink(link);
    }),

    // triplea://trips/trip_901 and https://…/trips/trip_901 both resolve here.
    App.addListener('appUrlOpen', (event) => {
      try {
        const url = new URL(event.url);
        onDeepLink(`${url.pathname}${url.search}`);
      } catch {
        // Malformed link — ignore rather than crash the listener.
      }
    }),

    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    }),
  ]);

  return () => {
    handles.forEach((handle) => void handle.remove());
  };
}
