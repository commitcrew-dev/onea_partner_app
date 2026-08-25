import { cn } from '@/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
}

/** iOS-style toggle — brand orange when on, matching the Dark Mode switch. */
export function Switch({ checked, onChange, label, disabled, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[34px] w-[58px] shrink-0 items-center rounded-pill p-[3px]',
        'transition-colors duration-200 disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-line dark:bg-white/15',
      )}
    >
      <span
        className={cn(
          'h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
          checked ? 'translate-x-6' : 'translate-x-0',
        )}
      />
    </button>
  );
}
