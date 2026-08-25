import { motion } from 'framer-motion';

interface SuccessAnimationProps {
  size?: number;
  label?: string;
}

/** Animated tick used when an OTP verifies or a trip is marked delivered. */
export function SuccessAnimation({ size = 88, label = 'Success' }: SuccessAnimationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      role="img"
      aria-label={label}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 260 }}
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-success"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <motion.path
        d="M15 27l8 8 15-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.32, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}
