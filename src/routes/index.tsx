import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Spinner } from '@/components/ui/Spinner';
import { SplashPage } from '@/features/auth/SplashPage';
import { RequireAuth, RequireGuest } from './guards';

/* Each screen is its own chunk so the first paint ships only the auth flow. */
const OnboardingPage = lazy(() =>
  import('@/features/auth/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const OtpPage = lazy(() =>
  import('@/features/auth/OtpPage').then((m) => ({ default: m.OtpPage })),
);
const NotRegisteredPage = lazy(() =>
  import('@/features/auth/NotRegisteredPage').then((m) => ({ default: m.NotRegisteredPage })),
);
const IndentsPage = lazy(() =>
  import('@/features/indents/IndentsPage').then((m) => ({ default: m.IndentsPage })),
);
const IndentDetailPage = lazy(() =>
  import('@/features/indents/IndentDetailPage').then((m) => ({ default: m.IndentDetailPage })),
);
const TripsPage = lazy(() =>
  import('@/features/trips/TripsPage').then((m) => ({ default: m.TripsPage })),
);
const TripDetailPage = lazy(() =>
  import('@/features/trips/TripDetailPage').then((m) => ({ default: m.TripDetailPage })),
);
const TrucksPage = lazy(() =>
  import('@/features/trucks/TrucksPage').then((m) => ({ default: m.TrucksPage })),
);
const TruckDetailPage = lazy(() =>
  import('@/features/trucks/TruckDetailPage').then((m) => ({ default: m.TruckDetailPage })),
);
const AddTruckPage = lazy(() =>
  import('@/features/trucks/AddTruckPage').then((m) => ({ default: m.AddTruckPage })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const NotificationsPage = lazy(() =>
  import('@/features/notifications/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const HelpPage = lazy(() =>
  import('@/features/settings/HelpPage').then((m) => ({ default: m.HelpPage })),
);
const AboutPage = lazy(() =>
  import('@/features/settings/AboutPage').then((m) => ({ default: m.AboutPage })),
);

function RouteFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-surface">
      <Spinner className="h-8 w-8 text-brand" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={ROUTES.splash} element={<SplashPage />} />

        <Route element={<RequireGuest />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.otp} element={<OtpPage />} />
            <Route path={ROUTES.notRegistered} element={<NotRegisteredPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.indents} element={<IndentsPage />} />
            <Route path={ROUTES.indentDetail} element={<IndentDetailPage />} />

            <Route path={ROUTES.trips} element={<TripsPage />} />
            <Route path={ROUTES.tripDetail} element={<TripDetailPage />} />

            <Route path={ROUTES.trucks} element={<TrucksPage />} />
            {/* Declared before `:truckId` so "new" is never read as an id. */}
            <Route path={ROUTES.addTruck} element={<AddTruckPage />} />
            <Route path={ROUTES.truckDetail} element={<TruckDetailPage />} />

            <Route path={ROUTES.profile} element={<ProfilePage />} />
            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
            <Route path={ROUTES.help} element={<HelpPage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
      </Routes>
    </Suspense>
  );
}
