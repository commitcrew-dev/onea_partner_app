import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DataRowProps {
  label: string;
  value: ReactNode;
  /** Right-hand emphasis: `strong` for totals, `danger` for deductions. */
  tone?: 'default' | 'strong' | 'danger';
  className?: string;
}

/** Label-left / value-right row used by trip details and payment summaries. */
export function DataRow({ label, value, tone = 'default', className }: DataRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-4 py-3.5', className)}>
      <span
        className={cn(
          'text-[12px]',
          tone === 'strong' ? 'font-bold text-content' : 'text-muted',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'tnum text-right text-[12px] font-bold',
          tone === 'danger' ? 'text-brand' : 'text-content',
        )}
      >
        {value}
      </span>
    </div>
  );
}

interface DataGroupProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function DataGroup({ children, title, className }: DataGroupProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-faint">
          {title}
        </h2>
      )}
      <div className="card-base divide-y divide-line">{children}</div>
    </section>
  );
}
