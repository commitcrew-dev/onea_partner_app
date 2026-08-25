import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryClient';
import { indentService } from '@/services/indent.service';
import { tripService } from '@/services/trip.service';
import { notificationService } from '@/services/notification.service';
import { DEFAULT_INDENT_FILTERS } from '@/services/indent.service';
import type { TabKey } from './navItems';

/**
 * Badge counts for the tab bar: open indents, ongoing trips, unread
 * notifications. Shares the query cache with the screens themselves.
 */
export function useTabBadges(): Record<TabKey, number> & { notifications: number } {
  const { data: indents } = useQuery({
    queryKey: queryKeys.indents.list(DEFAULT_INDENT_FILTERS),
    queryFn: () => indentService.list(DEFAULT_INDENT_FILTERS),
  });

  const { data: trips } = useQuery({
    queryKey: queryKeys.trips.list('ongoing'),
    queryFn: () => tripService.list('ongoing'),
  });

  const { data: notifications } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.list(),
  });

  return {
    indents: indents?.filter((indent) => indent.status === 'open').length ?? 0,
    trips: trips?.length ?? 0,
    trucks: 0,
    profile: 0,
    notifications: notifications?.filter((notification) => !notification.read).length ?? 0,
  };
}
