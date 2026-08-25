import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiBell,
  FiCheckCircle,
  FiFileText,
  FiTrash2,
  FiTrendingUp,
  FiTruck,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { queryKeys } from '@/api/queryClient';
import { notificationService } from '@/services/notification.service';
import { useHaptics } from '@/hooks/useHaptics';
import { useUiStore } from '@/store/ui.store';
import { formatRelative } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { AppNotification, NotificationKind } from '@/types';

const KIND_ICON: Record<NotificationKind, IconType> = {
  indent: FiFileText,
  trip: FiTruck,
  payment: FiTrendingUp,
  document: FiCheckCircle,
  system: FiBell,
};

const KIND_TINT: Record<NotificationKind, string> = {
  indent: 'bg-brand-100 text-brand dark:bg-brand-900/30',
  trip: 'bg-info/10 text-info',
  payment: 'bg-success/15 text-success',
  document: 'bg-warning/20 text-warning',
  system: 'bg-surface-alt text-muted',
};

interface RowProps {
  notification: AppNotification;
  index: number;
  onOpen: (notification: AppNotification) => void;
  onDelete: (id: string) => void;
}

/** Swipe left (or press Delete) to remove a notification. */
function NotificationRow({ notification, index, onOpen, onDelete }: RowProps) {
  const Icon = KIND_ICON[notification.kind];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.24) }}
      className="relative overflow-hidden rounded-card"
    >
      {/* Revealed as the card is dragged aside. */}
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-danger text-white">
        <FiTrash2 size={22} aria-hidden />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -96, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) onDelete(notification.id);
        }}
        className={cn(
          'relative flex cursor-pointer gap-3.5 bg-card p-4',
          !notification.read && 'ring-1 ring-inset ring-brand/30',
        )}
        onClick={() => onOpen(notification)}
      >
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            KIND_TINT[notification.kind],
          )}
        >
          <Icon size={20} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                'flex-1 text-[13px] leading-snug text-content',
                notification.read ? 'font-bold' : 'font-extrabold',
              )}
            >
              {notification.title}
            </h3>
            {!notification.read && (
              <span aria-label="Unread" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
            )}
          </div>

          <p className="mt-1 text-[12px] leading-relaxed text-muted">{notification.body}</p>
          <p className="mt-1.5 text-[11px] text-faint">{formatRelative(notification.at)}</p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(notification.id);
          }}
          aria-label={`Delete "${notification.title}"`}
          className="shrink-0 self-start rounded-full p-1.5 text-faint transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <FiTrash2 size={17} />
        </button>
      </motion.div>
    </motion.li>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const { selection, success } = useHaptics();

  const query = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.list(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      success();
      pushToast('All notifications marked as read.', 'success');
      void invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => {
      selection();
      void invalidate();
    },
  });

  const unread = query.data?.filter((notification) => !notification.read).length ?? 0;

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <PageLayout title="Notifications" showBack>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-muted">
          {unread > 0 ? `${unread} unread` : 'You’re all caught up'}
        </p>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-[12px] font-bold text-brand disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {query.isPending && <ListSkeleton count={4} />}

      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

      {query.isSuccess &&
        (query.data.length === 0 ? (
          <EmptyState
            icon={<FiBell />}
            title="No notifications"
            description="Updates about new indents, trip progress and payments will appear here."
          />
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {query.data.map((notification, index) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onOpen={handleOpen}
                  onDelete={(id) => remove.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        ))}
    </PageLayout>
  );
}
