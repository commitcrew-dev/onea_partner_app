import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastViewport } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { useThemeStore } from '@/store/theme.store';
import { configureKeyboard, configureStatusBar, initNativeListeners } from '@/services/native.service';
import { applyPlatformClasses } from '@/theme/platform';

// Tags <html> with the platform/mode classes. See src/theme/platform.ts for why
// this stands in for setupIonicReact().
applyPlatformClasses();

/** Runs one-time bootstrap that needs router access. */
function Bootstrap() {
  const navigate = useNavigate();
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    void hydrateAuth();
    void hydrateTheme();
    void hydrateSettings();
    void configureStatusBar();
    void configureKeyboard();
  }, [hydrateAuth, hydrateTheme, hydrateSettings]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    void initNativeListeners((path) => navigate(path)).then((dispose) => {
      cleanup = dispose;
    });

    return () => cleanup?.();
  }, [navigate]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Bootstrap />
          <AppRoutes />
          <ToastViewport />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
