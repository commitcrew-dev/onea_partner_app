import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { BottomTabs } from '@/components/layout/BottomTabs';
import { Drawer } from '@/components/layout/Drawer';
import { Sidebar } from '@/components/layout/Sidebar';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ROUTES } from '@/constants';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/auth.store';

/**
 * Chrome shared by every authenticated screen. Renders the bottom tab bar on
 * touch layouts and swaps to a collapsible sidebar from `lg` upwards.
 */
export function AppShell() {
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((state) => state.signOut);

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    // Drop every cached query so the next partner never sees stale data.
    queryClient.clear();
    setLoggingOut(false);
    setConfirmingLogout(false);
    navigate(ROUTES.login, { replace: true });
  };

  // Detail screens push over the tab bar rather than sitting beside it.
  const isDetailRoute = /\/(indents|trips|trucks)\/[^/]+$/.test(location.pathname);
  const showTabs = !isDesktop && !isDetailRoute;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface">
      {isDesktop && <Sidebar onLogout={() => setConfirmingLogout(true)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />

        <div className="relative min-h-0 flex-1">
          {/* No mode="wait" — it deadlocks with Suspense on first visit to a lazy route. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {showTabs && <BottomTabs />}
      </div>

      {!isDesktop && <Drawer onLogout={() => setConfirmingLogout(true)} />}

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need your mobile number and an OTP to sign back in."
        confirmLabel="Log Out"
        tone="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
