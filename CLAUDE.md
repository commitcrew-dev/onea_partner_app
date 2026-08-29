# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TripleA Transport — Partner App. A React 19 + Capacitor SPA for fleet partners to browse
open indents, track trips, manage trucks, and view payments. One codebase ships to
Android, iOS, mobile web, tablet, desktop and PWA. `@ionic/react` is a dependency but not
imported at runtime — see "Notes and known trade-offs" at the bottom of README.md for why
(only its ~15-line platform-class logic was reproduced, in `src/theme/platform.ts`).

## Commands

```bash
npm run dev            # Vite dev server with HMR (port 5173)
npm run build           # tsc -b && vite build → dist/
npm run preview         # serve the production build locally
npm run typecheck       # TypeScript only, no emit
npm run lint             # ESLint (flat config)
npm run lint:fix
npm run format           # Prettier across src/
npm test                 # Vitest, single run
npm run test:watch
npm run coverage         # Coverage report (v8)
npm run cap:sync         # build, then sync web assets into native projects
npm run cap:android       # sync + open Android Studio
npm run cap:ios           # sync + open Xcode
```

Run a single test file: `npx vitest run src/utils/format.test.ts`
Run tests matching a name: `npx vitest run -t "some test name"`

Requires Node 20.19+ (or 22.12+) and npm 10+. Copy `.env.example` to `.env` before first run.

## Architecture

```
Screens (features/*)  →  hooks + components
        │
State: Zustand (auth · theme · settings · ui) + React Query (indents · trips · trucks · notifications)
        │  typed service calls
Service layer (services/*.service.ts)   ← the ONLY seam to swap mock vs real backend
    if (USE_MOCKS)  → src/mocks/*.json (in-memory db, src/services/mock/db.ts)
    else            → apiClient (axios) → Node OneAPI
        │
api/client.ts — axios instance
  · bearer token from Capacitor Preferences
  · 401 → single-flight refresh → retry → else session expiry
  · every failure normalised to ApiFailure
```

**The key rule:** screens never call `axios` directly. They call a service, and each
service internally picks mock or HTTP based on `VITE_USE_MOCKS`. Flipping that env var
switches the whole app to the real backend with zero UI changes — when adding a new
service method, always add both branches (mock fixture + real endpoint call) together.

The expected OneAPI endpoint contract (paths, request/response shapes, error format,
auth/refresh flow) is documented in detail in README.md under "Connecting the Node OneAPI
backend" — read it before wiring up or changing a service against a real backend.

### State ownership

| Concern | Owner | Why |
| --- | --- | --- |
| Session, partner, OTP challenge | `store/auth.store.ts` | Survives reloads via Capacitor Preferences |
| Theme (light/dark/system) | `store/theme.store.ts` | Applied pre-paint to avoid a flash (see `index.html`) |
| Device settings | `store/settings.store.ts` | Optimistic toggles |
| Filters, sheets, drawer, toasts | `store/ui.store.ts` | Ephemeral UI only — do not put server data here |
| Server data (indents/trips/trucks/notifications) | React Query | Caching, retries, offline-first |

### Folder structure

```
src/
├── api/              axios client (interceptors, refresh) + React Query config
├── components/
│   ├── layout/       AppHeader · BottomTabs · Sidebar · Drawer · PageLayout · OfflineBanner
│   └── ui/           AppButton · AppCard · Badge · OTPInput · Sheet · Modal · Toast · Timeline …
├── constants/        routes, storage keys, status labels, cities, demo credentials
├── features/         one folder per domain — auth, indents, trips, trucks, profile, settings, notifications
├── hooks/            useCountdown · useHaptics · useMediaQuery · useNetworkStatus · useScrollReset
├── layouts/          AppShell (tabs/sidebar) · AuthLayout
├── mocks/            JSON fixtures — the mock database
├── routes/           route table (index.tsx, screens lazy-loaded per-route) + RequireAuth/RequireGuest guards
├── services/         ⭐ auth · indent · trip · truck · profile · notification · settings · storage · native
│   └── mock/db.ts    in-memory mock database used when VITE_USE_MOCKS=true
├── store/            Zustand stores
├── styles/           Tailwind layers + CSS custom properties for both themes
├── theme/            platform detection and mode classes
├── types/             the whole domain model
└── utils/             formatting (INR, dates, mobile), class names, Zod schemas
```

The `@` import alias resolves to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Theme system

Colors are CSS custom properties in `src/styles/index.css`, consumed through semantic
Tailwind names (`bg-surface`, `text-content`, `border-line`) — never hardcode hex colors
in components. Switching themes flips one class on `<html>`, applied pre-paint by an
inline script in `index.html` to avoid a flash of the wrong palette.

### Environment variables

Only `VITE_`-prefixed keys reach the bundle (see `.env.example`). Notably `VITE_USE_MOCKS`
(default `true`) toggles the mock/real backend switch described above, and `VITE_MOCK_LATENCY`
adds artificial delay so loading/skeleton states get exercised during development.

## Conventions enforced by lint

- `@typescript-eslint/no-explicit-any`: error — no `any`.
- `@typescript-eslint/consistent-type-imports`: type-only imports must use `import type`.
- `no-console`: error except `console.warn`/`console.error` — the app surfaces failures
  through toasts and error states, never plain console logs.
- `eqeqeq` (always), `no-debugger`: error.

## Testing

Vitest + React Testing Library, jsdom environment (`src/test/setup.ts` resets the mock
database and `localStorage` between tests, so cases stay independent). Test files sit
next to the code they cover (`*.test.ts(x)`).
