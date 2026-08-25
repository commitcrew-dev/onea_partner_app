import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface HeroBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Right-side slot — usually a metric pill or CTA. */
  right?: ReactNode;
  /** Rendered below the title block — chips, quick actions, filters. */
  children?: ReactNode;
  className?: string;
}

/**
 * The brand-gradient banner that sits at the top of list pages. Full-bleed
 * inside a `padded={false}` PageLayout. Big, warm, unapologetically brand.
 */
export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  right,
  children,
  className,
}: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        // Floating card: horizontal margin + full rounding + strong brand shadow.
        'relative mx-4 mt-4 overflow-hidden rounded-hero bg-brand-hero px-5 pt-5 pb-6 text-white shadow-xl shadow-brand/30',
        className,
      )}
    >
      {/* Ambient glow discs — cheap depth without a background image. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-black/10 blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-white">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-[12px] text-white/85">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>

      {children && <div className="relative mt-5">{children}</div>}
    </motion.section>
  );
}

/** Frosted stat pill for use on top of the hero (dark-glass look). */
export function HeroStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-md',
        className,
      )}
    >
      <p className="tnum text-[16px] font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/75">
        {label}
      </p>
    </div>
  );
}
