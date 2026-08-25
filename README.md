# TripleA Transport — Partner App

Production-ready frontend for the TripleA Transport partner network. Fleet partners
browse open indents, track trips from assignment to delivery, manage their trucks and
see itemised payments.

One codebase ships to **Android, iOS, mobile web, tablet, desktop and PWA**.

The UI is reproduced from the supplied design recording — cream/navy/orange palette,
four-tab layout (Indents · Trips · Trucks · Profile), navy filter sheet and dark mode.

---

## Table of contents

- [Quick start](#quick-start)
- [Demo credentials](#demo-credentials)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Screens](#screens)
- [Theme system](#theme-system)
- [Connecting the Node OneAPI backend](#connecting-the-node-oneapi-backend)
- [Building for Android](#building-for-android)
- [Building for iOS](#building-for-ios)
- [Web and PWA build](#web-and-pwa-build)
- [Deployment](#deployment)
- [Testing](#testing)
- [Notes and known trade-offs](#notes-and-known-trade-offs)

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173>.

Requires Node 20.19+ (or 22.12+) and npm 10+.

---

## Demo credentials

The mock backend accepts exactly one pair:

| Field | Value |
| --- | --- |
| Mobile | `9876554322` |
| OTP | `987654` |

Behaviour worth exercising:

- **Any other mobile number** + the correct OTP → the "You're not registered yet" screen.
- **Any wrong OTP** → inline shake, error toast and a decreasing attempt count.
- Sessions persist across reloads (auto-login) and expire after 24 hours.

---

## Environment variables

Only `VITE_`-prefixed keys reach the browser bundle. See `.env.example`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `https://api.example.com` | Base URL of the Node OneAPI service. |
| `VITE_API_TIMEOUT` | `20000` | Axios request timeout (ms). |
| `VITE_USE_MOCKS` | `true` | Serve screens from `src/mocks`. Set `false` to hit the real API. |
| `VITE_MOCK_LATENCY` | `450` | Artificial delay (ms) so loading/skeleton states are exercised. |
| `VITE_APP_VERSION` | `1.0.0` | Shown on Profile/About; sent as `X-Client-Version`. |
| `VITE_SUPPORT_PHONE` | `+914446313131` | Support line used by "Call Support". |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | Type-check then production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run typecheck` | TypeScript only, no emit. |
| `npm run lint` / `lint:fix` | ESLint (flat config). |
| `npm run format` | Prettier across `src/`. |
| `npm test` | Vitest, single run. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run coverage` | Coverage report (v8). |
| `npm run cap:sync` | Build, then sync web assets into the native projects. |
| `npm run cap:android` | Sync and open Android Studio. |
| `npm run cap:ios` | Sync and open Xcode. |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Screens (features/*)                                        │
│  Indents · Trips · Trucks · Profile · Settings · Auth         │
└───────────────┬──────────────────────────────────────────────┘
                │ hooks + components
┌───────────────▼──────────────────────────────────────────────┐
│  State                                                       │
│  Zustand  → auth · theme · settings · ui (session/UI state)   │
│  React Query → indents · trips · trucks · notifications       │
└───────────────┬──────────────────────────────────────────────┘
                │ typed service calls
┌───────────────▼──────────────────────────────────────────────┐
│  Service layer (services/*.service.ts)   ← ONLY seam to swap  │
│                                                              │
│    if (USE_MOCKS)  → src/mocks/*.json (in-memory db)          │
│    else            → apiClient (axios) → Node OneAPI          │
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│  api/client.ts — axios instance                              │
│  · bearer token from Capacitor Preferences                   │
│  · 401 → single-flight refresh → retry → else session expiry │
│  · every failure normalised to ApiFailure                    │
└──────────────────────────────────────────────────────────────┘
```

**The key rule:** screens never call `axios` directly. They call a service, and each
service picks mock or HTTP internally. Turning off `VITE_USE_MOCKS` switches the whole
app to the real backend with **zero UI changes**.

### State ownership

| Concern | Owner | Why |
| --- | --- | --- |
| Session, partner, OTP challenge | `store/auth.store.ts` | Survives reloads via Preferences. |
| Theme (light/dark/system) | `store/theme.store.ts` | Applied pre-paint to avoid a flash. |
| Device settings | `store/settings.store.ts` | Optimistic toggles. |
| Filters, sheets, drawer, toasts | `store/ui.store.ts` | Ephemeral UI only. |
| Server data | React Query | Caching, retries, offline-first. |

---

## Folder structure

```
src/
├── api/              axios client (interceptors, refresh) + React Query config
├── assets/logos/     brand mark used by header, splash and About
├── components/
│   ├── layout/       AppHeader · BottomTabs · Sidebar · Drawer · PageLayout · OfflineBanner
│   └── ui/           AppButton · AppCard · Badge · OTPInput · Sheet · Modal · Toast · Timeline …
├── constants/        routes, storage keys, status labels, cities, demo credentials
├── features/         one folder per domain — auth, indents, trips, trucks, profile, settings, notifications
├── hooks/            useCountdown · useHaptics · useMediaQuery · useNetworkStatus · useScrollReset
├── layouts/          AppShell (tabs/sidebar) · AuthLayout
├── mocks/            JSON fixtures — the mock database
├── routes/           route table + RequireAuth / RequireGuest guards
├── services/         ⭐ auth · indent · trip · truck · profile · notification · settings · storage · native
├── store/            Zustand stores
├── styles/           Tailwind layers + CSS custom properties for both themes
├── theme/            platform detection and mode classes
├── types/            the whole domain model
└── utils/            formatting (INR, dates, mobile), class names, Zod schemas
```

---

## Screens

| Route | Screen |
| --- | --- |
| `/` | Splash — brand frame while the session is restored |
| `/onboarding` | Three-slide intro, shown once |
| `/login` | Mobile number entry (+91) |
| `/login/otp` | Six-box OTP with countdown, paste, auto-submit |
| `/login/not-registered` | Unregistered number → Call Support |
| `/indents` | Available indents + navy filter sheet |
| `/indents/:id` | Indent detail with Accept Load |
| `/trips` | My Trips — Ongoing / Completed |
| `/trips/:id` | Status timeline, truck details, payment summary |
| `/trucks` | Fleet list |
| `/trucks/new` | Add a truck (React Hook Form + Zod) |
| `/trucks/:id` | Truck detail, documents, trip history |
| `/profile` | Identity, dark mode, documents, payment details |
| `/notifications` | List with swipe-to-delete and mark-all-read |
| `/settings` | Theme, language, notifications, biometrics, change mobile |
| `/help`, `/about` | FAQs and support; app/company info |

Every screen has real mock data plus loading, empty and error states.

---

## Theme system

Colours were sampled directly from the design recording:

| Token | Light | Dark |
| --- | --- | --- |
| Page background | `#F9EBE0` | `#131218` |
| Card | `#FFFFFF` | `#1B1C21` |
| Header | `#0A1028` | `#050511` |
| Brand | `#EF4423` | `#EF4423` |

Implemented as CSS custom properties in `src/styles/index.css`, consumed through
semantic Tailwind names (`bg-surface`, `text-content`, `border-line`). Switching
themes flips one class on `<html>` — no component re-styling.

A small script in `index.html` applies the stored theme **before first paint**, so the
app never flashes the wrong palette.

---

## Connecting the Node OneAPI backend

1. Point the app at your service and turn mocks off:

   ```dotenv
   VITE_API_URL=https://oneapi.your-domain.in
   VITE_USE_MOCKS=false
   ```

2. That is the whole switch — provided the API matches the contract below. Each
   service already contains the real call next to the mock branch.

### Expected endpoints

Responses are wrapped as `{ "data": … }` (see `ApiEnvelope<T>` in `src/types`).

| Method | Path | Returns |
| --- | --- | --- |
| `POST` | `/auth/otp/request` | `OtpChallenge` |
| `POST` | `/auth/otp/verify` | `OtpVerifyOutcome` |
| `POST` | `/auth/otp/resend` | `OtpChallenge` |
| `POST` | `/auth/refresh` | `AuthTokens` |
| `GET` | `/auth/me` | `Partner` |
| `POST` | `/auth/logout` | — |
| `GET` | `/indents` | `Indent[]` (query: status, date, route, type) |
| `GET` | `/indents/:id` | `Indent` |
| `POST` | `/indents/:id/accept` | `Indent` |
| `GET` | `/trips?scope=ongoing\|completed` | `Trip[]` |
| `GET` | `/trips/:id` | `Trip` |
| `PATCH` | `/trips/:id/status` | `Trip` |
| `GET` | `/trucks` · `/trucks/:id` | `Truck[]` · `Truck` |
| `POST` | `/trucks` | `Truck` |
| `PATCH` | `/trucks/:id/status` | `Truck` |
| `GET` / `PATCH` | `/profile`, `/profile/bank` | `Partner` |
| `POST` | `/profile/mobile/request` · `/confirm` | challenge · `Partner` |
| `GET` | `/notifications` | `AppNotification[]` |
| `PATCH` | `/notifications/:id/read` | `AppNotification` |
| `POST` | `/notifications/read-all` | `AppNotification[]` |
| `DELETE` | `/notifications/:id` | — |
| `POST` | `/notifications/devices` | — (FCM/APNs token) |
| `GET` / `PATCH` | `/settings` | `AppSettings` |

### Error contract

Non-2xx responses should return `{ "code": "…", "message": "…" }`. The interceptor
converts these to `ApiFailure`, which `ErrorState` renders directly.

### Auth contract

- `Authorization: Bearer <accessToken>` is attached automatically.
- A `401` triggers **one** refresh against `/auth/refresh`; concurrent 401s share it.
- If refresh fails, the session is cleared and the partner returns to `/login`.

---

## Building for Android

```bash
npm install @capacitor/cli --save-dev      # already included
npx cap add android
npm run cap:sync
npx cap open android
```

Then in Android Studio: **Build → Generate Signed Bundle / APK**.

- Application ID: `in.triplea.partner` (change in `capacitor.config.ts`).
- Splash/status bar colours are preconfigured to the brand navy `#0A1028`.
- For push, drop `google-services.json` into `android/app/` and enable Firebase
  Cloud Messaging; `src/services/native.service.ts` already registers the token.
- Deep links: add an `intent-filter` for `triplea://` in `AndroidManifest.xml`.

## Building for iOS

Requires macOS with **full Xcode** (Command Line Tools alone is not enough).

```bash
npx cap add ios
npm run cap:sync
npx cap open ios
```

Then in Xcode: set your team under **Signing & Capabilities**, add the **Push
Notifications** capability, and **Product → Archive**.

- `Info.plist` needs `NSCameraUsageDescription` before enabling the camera.
- Deep links: register the `triplea` URL scheme, or add an Associated Domain for
  universal links.

## Web and PWA build

```bash
npm run build      # → dist/
npm run preview    # verify locally
```

`vite-plugin-pwa` generates the manifest and a Workbox service worker:

- App shell is precached; fonts use cache-first.
- `/api/*` uses network-first with a 5-second timeout, so the last good payload
  still renders offline.
- Update prompt and install prompt are both handled by `components/PwaPrompt.tsx`.

Icons are generated from the supplied logo into `public/`
(192, 512, maskable 512, apple-touch, favicons).

## Deployment

The build is fully static — any static host works.

```bash
npm run build
# then deploy dist/
```

**Single-page app rewrite is required.** Every route must fall back to
`index.html`, otherwise deep links 404 on refresh.

- Netlify — `_redirects`: `/*  /index.html  200`
- Vercel — `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Nginx — `try_files $uri $uri/ /index.html;`

Set the production `VITE_API_URL` and `VITE_USE_MOCKS=false` in the host's
environment settings before building.

---

## Testing

```bash
npm test
npm run coverage
```

Vitest + React Testing Library, jsdom environment. 35 tests cover:

- `utils/format` — INR grouping, signed TDS amounts, date and mobile formatting
- `services/indent.service` — all four filter facets, conjunctive combinations, accept conflicts
- `services/auth.service` — the three OTP outcomes, and that challenges don't leak which numbers are registered
- `components/ui/OTPInput` — auto-advance, backspace, arrows, paste, completion

`src/test/setup.ts` resets the mock database and `localStorage` between tests, so
cases stay independent.

---

## Notes and known trade-offs

**Ionic React is installed but not imported at runtime.** Importing `@ionic/react`
pulls in the entire component library — 1.1 MB (227 KB gzip), roughly four times the
rest of the app — and the only thing it contributed was the `ios`/`md` platform class,
since every component here is custom-built to match the design. That class is
reproduced in `src/theme/platform.ts` (~15 lines). The dependency is retained so Ionic
components can be adopted later without re-plumbing. Total bundle is now **216 KB
gzip** across all chunks.

**`react-router` carries an open advisory** (GHSA-qwww-vcr4-c8h2, RSC-mode CSRF).
It requires React Server Components with server actions; this is a client-side SPA
with neither, so it is not reachable. Version 7.18.1 is the latest published — there
is no fixed release to upgrade to yet. Worth re-checking when v8 ships.

**The Trucks tab was not shown in the source recording.** It is designed to match the
established visual language, with statuses (`Waiting For Load`, `Unloading`) taken
from the existing internal ops tool.

**Recharts is a dependency but currently unused** — the design has no charts. It is
kept for the analytics screens that will likely follow; it is tree-shaken out of the
build, so it costs nothing today.

**Mock mutations are in-memory.** Accepting an indent or adding a truck persists for
the session and resets on reload. Only auth tokens, the partner record, theme and
settings are written to storage.
