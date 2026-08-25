/**
 * Domain model for the TripleA Transport partner app.
 * These shapes mirror what the Node OneAPI service returns, so swapping the
 * mock adapters for real HTTP calls requires no changes above the service layer.
 */

export type ISODateString = string;

/* ------------------------------------------------------------------ auth -- */

export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated' | 'expired';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds at which `accessToken` stops being accepted. */
  expiresAt: number;
}

export interface OtpChallenge {
  /** Opaque handle echoed back on verify; the OTP itself never round-trips. */
  challengeId: string;
  mobile: string;
  /** Seconds until "Resend code" becomes available again. */
  resendAfterSeconds: number;
  expiresInSeconds: number;
}

export type OtpVerifyOutcome =
  | { result: 'success'; tokens: AuthTokens; partner: Partner }
  | { result: 'invalid-otp'; attemptsRemaining: number }
  | { result: 'not-registered'; mobile: string };

/* --------------------------------------------------------------- partner -- */

export interface BankDetails {
  accountHolder: string;
  /** Already masked by the API — the app never receives full account numbers. */
  accountNumberMasked: string;
  bank: string;
  gpayNumber: string;
  gpayName: string;
}

export type DocumentStatus = 'verified' | 'pending' | 'expired' | 'rejected';

export interface PartnerDocument {
  id: string;
  label: string;
  status: DocumentStatus;
  expiresOn?: ISODateString;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  mobile: string;
  company: string;
  city: string;
  /** Two-letter fallback rendered when there is no avatar image. */
  initials: string;
  avatarUrl?: string;
  panMasked: string;
  memberSince: ISODateString;
  rating: number;
  documents: PartnerDocument[];
  bank: BankDetails;
}

/* ---------------------------------------------------------------- indent -- */

export type IndentStatus = 'open' | 'assigned' | 'closed';

export type LoadType = 'FMCG' | 'Textiles' | 'Auto Parts' | 'Cement' | 'Agri Produce';

export type VehicleType =
  | '32ft SXL'
  | '32ft MXL'
  | '20ft Container'
  | '6-Wheeler'
  | '10-Wheeler'
  | '22ft Open';

export interface Indent {
  id: string;
  /** Human-facing reference shown as `#1201`. */
  reference: string;
  origin: string;
  destination: string;
  contactName: string;
  contactMobile: string;
  weightTon: number;
  vehicleType: VehicleType;
  loadType: LoadType;
  amount: number;
  /** Date the load must be picked up. */
  loadingDate: ISODateString;
  status: IndentStatus;
  postedAt: ISODateString;
  notes?: string;
}

export interface IndentFilters {
  status: IndentStatus | 'all';
  /** ISO date, or `all` for no date constraint. */
  date: ISODateString | 'all';
  /**
   * Selected branches — matches either origin or destination against any entry.
   * An empty array means "all branches".
   */
  route: string[];
  type: LoadType | 'all';
}

/* ------------------------------------------------------------------ trip -- */

export type TripStatus = 'assigned' | 'started' | 'in-transit' | 'delivered' | 'cancelled';

export interface TripTimelineEntry {
  /** Numeric id from trip.trip_status.id — the source of truth for step ordering. */
  id?: number;
  /** Legacy status key kept for backward compatibility with mocks. */
  status: TripStatus | string;
  /** Label from trip.trip_status.name (e.g. "Waiting For Load"). */
  label: string;
  /** Optional descriptive line — hidden on the compact vertical timeline. */
  description?: string;
  at: ISODateString | null;
  complete: boolean;
  /** True for the row that matches the trip's current status. */
  current?: boolean;
}

export interface PaymentSummary {
  tripRate: number;
  tdsPercent: number;
  tdsAmount: number;
  advancePaid: number;
  totalPayable: number;
  balanceDue: number;
}

export interface Trip {
  id: string;
  reference: string;
  indentReference: string;
  origin: string;
  destination: string;
  contactName: string;
  contactMobile: string;
  truckNumber: string;
  loadType: LoadType;
  weightTon: number;
  vehicleType: VehicleType;
  /** Date the indent was raised — shown on the detail screen. */
  orderDate: ISODateString;
  /** Date the load is picked up — the date shown in the trip list. */
  loadingDate: ISODateString;
  status: TripStatus;
  /** Raw label from trip.trip_status.name — preferred when rendering. */
  statusLabel?: string | null;
  /** Raw trip_status_id from the DB, for callers that need the numeric key. */
  statusId?: number | null;
  timeline: TripTimelineEntry[];
  payment: PaymentSummary;
}

/* ----------------------------------------------------------------- truck -- */

export type TruckStatus = 'waiting-for-load' | 'on-trip' | 'unloading' | 'maintenance';

export interface Truck {
  id: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  capacityTon: number;
  city: string;
  driverName: string;
  driverMobile: string;
  status: TruckStatus;
  documents: PartnerDocument[];
  /** Present only while `status` is `on-trip`. */
  currentTripReference?: string;
  lastTripAt: ISODateString;
}

export type NewTruckInput = Pick<
  Truck,
  'registrationNumber' | 'vehicleType' | 'capacityTon' | 'city' | 'driverName' | 'driverMobile'
>;

/* --------------------------------------------------------- notifications -- */

export type NotificationKind = 'indent' | 'trip' | 'payment' | 'document' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: ISODateString;
  read: boolean;
  /** In-app route opened when the notification is tapped. */
  link?: string;
}

/* -------------------------------------------------------------- settings -- */

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ta' | 'hi';

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  pushEnabled: boolean;
  biometricEnabled: boolean;
  tripAlerts: boolean;
  paymentAlerts: boolean;
}

/* ------------------------------------------------------------------- api -- */

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiFailure {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
