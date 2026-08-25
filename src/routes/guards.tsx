import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';

function FullScreenLoader() {
  return (
    <div className="flex h-dvh items-center justify-center bg-surface">
      <Spinner className="h-8 w-8 text-brand" />
    </div>
  );
}

/**
 * Blocks the authenticated app until a stored session has been read, then
 * redirects to login — preserving where the partner was heading.
 */
export function RequireAuth() {
  const { status, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) return <FullScreenLoader />;

  if (status !== 'authenticated') {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Keeps a signed-in partner out of the login flow. */
export function RequireGuest() {
  const { status, hydrated } = useAuthStore();

  if (!hydrated) return <FullScreenLoader />;

  if (status === 'authenticated') return <Navigate to={ROUTES.indents} replace />;

  return <Outlet />;
}
