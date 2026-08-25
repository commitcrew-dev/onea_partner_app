import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiWifiOff } from 'react-icons/fi';
import { AppButton } from './AppButton';
import type { ApiFailure } from '@/types';

interface ErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}

function messageFor(error: unknown): { title: string; body: string; offline: boolean } {
  const failure = error as ApiFailure | undefined;

  if (failure?.code === 'NETWORK' || failure?.status === 0) {
    return {
      title: "You're offline",
      body: 'Check your mobile data or Wi-Fi connection, then try again.',
      offline: true,
    };
  }
  if (failure?.code === 'TIMEOUT') {
    return {
      title: 'That took too long',
      body: 'The server did not respond in time. Please try again.',
      offline: false,
    };
  }
  if (failure?.status === 404) {
    return {
      title: 'Not found',
      body: failure.message || 'This record is no longer available.',
      offline: false,
    };
  }
  return {
    title: 'Something went wrong',
    body: failure?.message || 'We could not load this right now. Please try again.',
    offline: false,
  };
}

export function ErrorState({ error, onRetry, title }: ErrorStateProps) {
  const detail = messageFor(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      className="flex flex-col items-center px-8 py-16 text-center"
    >
      <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-warning/15 text-[20px] text-warning">
        {detail.offline ? <FiWifiOff /> : <FiAlertTriangle />}
      </div>
      <h2 className="text-[13px] font-extrabold text-content">{title ?? detail.title}</h2>
      <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">{detail.body}</p>
      {onRetry && (
        <AppButton className="mt-6" onClick={onRetry} leftIcon={<FiRefreshCw />}>
          Try again
        </AppButton>
      )}
    </motion.div>
  );
}
