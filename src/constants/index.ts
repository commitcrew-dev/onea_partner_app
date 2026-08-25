import type {
  DocumentStatus,
  IndentStatus,
  LoadType,
  TripStatus,
  TruckStatus,
  VehicleType,
} from '@/types';

export const APP_NAME = 'TripleA Transport';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';
export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE ?? '+914446313131';

/** Keys used with Capacitor Preferences / localStorage. Namespaced to avoid collisions. */
export const STORAGE_KEYS = {
  tokens: 'triplea.auth.tokens',
  partner: 'triplea.auth.partner',
  theme: 'triplea.theme',
  settings: 'triplea.settings',
  notificationsRead: 'triplea.notifications.read',
  onboardingSeen: 'triplea.onboarding.seen',
} as const;

export const ROUTES = {
  splash: '/',
  onboarding: '/onboarding',
  login: '/login',
  otp: '/login/otp',
  notRegistered: '/login/not-registered',
  indents: '/indents',
  indentDetail: '/indents/:indentId',
  trips: '/trips',
  tripDetail: '/trips/:tripId',
  trucks: '/trucks',
  truckDetail: '/trucks/:truckId',
  addTruck: '/trucks/new',
  profile: '/profile',
  notifications: '/notifications',
  settings: '/settings',
  help: '/help',
  about: '/about',
} as const;

/** OTP length and the resend cool-down, matching the six boxes in the design. */
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;
export const MOBILE_LENGTH = 10;

/** Demo credentials — the mock backend accepts this pair only. */
export const DEMO_MOBILE = '9876554322';
export const DEMO_OTP = '987654';

export const INDENT_STATUS_LABEL: Record<IndentStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  closed: 'Closed',
};

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  assigned: 'Assigned',
  started: 'Started',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const TRUCK_STATUS_LABEL: Record<TruckStatus, string> = {
  'waiting-for-load': 'Waiting For Load',
  'on-trip': 'On Trip',
  unloading: 'Unloading',
  maintenance: 'Maintenance',
};

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  expired: 'Expired',
  rejected: 'Rejected',
};

export const LOAD_TYPES: LoadType[] = [
  'FMCG',
  'Textiles',
  'Auto Parts',
  'Cement',
  'Agri Produce',
];

export const VEHICLE_TYPES: VehicleType[] = [
  '32ft SXL',
  '32ft MXL',
  '20ft Container',
  '6-Wheeler',
  '10-Wheeler',
  '22ft Open',
];

/** Cities the partner network operates across — drives the route filter. */
export const CITIES = [
  'Bengaluru',
  'Chennai',
  'Coimbatore',
  'Hyderabad',
  'Kochi',
  'Madurai',
  'Salem',
  'Trichy',
] as const;

/** Tailwind breakpoint (px) above which the sidebar replaces the bottom tab bar. */
export const DESKTOP_BREAKPOINT = 1024;
