import { FiSearch, FiX } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** `sheet` renders light-on-navy for use inside the filter sheet. */
  variant?: 'surface' | 'sheet';
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  variant = 'surface',
  className,
}: SearchBarProps) {
  const onSheet = variant === 'sheet';

  return (
    <div className={cn('relative', className)}>
      <FiSearch
        aria-hidden
        size={18}
        className={cn(
          'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2',
          onSheet ? 'text-white/45' : 'text-faint',
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'h-12 w-full rounded-2xl pl-11 pr-10 text-[12px] font-medium outline-none transition-colors',
          '[&::-webkit-search-cancel-button]:appearance-none',
          onSheet
            ? 'bg-white/10 text-white placeholder:text-white/45 focus:bg-white/15'
            : 'bg-card text-content placeholder:text-faint ring-1 ring-line focus:ring-brand',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1',
            onSheet ? 'text-white/55 hover:text-white' : 'text-faint hover:text-content',
          )}
        >
          <FiX size={17} />
        </button>
      )}
    </div>
  );
}
