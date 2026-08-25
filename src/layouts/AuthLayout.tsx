import { Outlet } from 'react-router-dom';
import { OfflineBanner } from '@/components/layout/OfflineBanner';

/** Chrome for the unauthenticated flow — no tabs, no sidebar. */
export function AuthLayout() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface">
      <OfflineBanner />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
