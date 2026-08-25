import type { IconType } from 'react-icons';
import { FiActivity, FiBell, FiFileText, FiTruck, FiUser } from 'react-icons/fi';
import { ROUTES } from '@/constants';

export type TabKey = 'indents' | 'trips' | 'trucks' | 'profile';

export interface NavItem {
  key: TabKey;
  label: string;
  to: string;
  icon: IconType;
}

/** The four primary destinations shown in the bottom tab bar / sidebar. */
export const TAB_ITEMS: NavItem[] = [
  { key: 'indents', label: 'Loads', to: ROUTES.indents, icon: FiFileText },
  { key: 'trips', label: 'Trips', to: ROUTES.trips, icon: FiActivity },
  { key: 'trucks', label: 'Trucks', to: ROUTES.trucks, icon: FiTruck },
  { key: 'profile', label: 'Profile', to: ROUTES.profile, icon: FiUser },
];

export interface DrawerItem {
  label: string;
  to: string;
  icon: IconType;
}

/** Secondary destinations in drawer / desktop sidebar (only Notifications for now). */
export const DRAWER_ITEMS: DrawerItem[] = [
  { label: 'Notifications', to: ROUTES.notifications, icon: FiBell },
];
