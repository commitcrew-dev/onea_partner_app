import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useHaptics } from '@/hooks/useHaptics';
import { TAB_ITEMS } from './navItems';
import { useTabBadges } from './useTabBadges';

/**
 * Four-tab bar — Indents, Trips, Trucks, Profile — pinned above the home
 * indicator. Replaced by the sidebar at desktop widths.
 */
export function BottomTabs() {
  const badges = useTabBadges();
  const { selection } = useHaptics();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 shrink-0 rounded-t-[20px] border-t border-line/70 bg-card/95 pb-safe backdrop-blur-md"
    >
      <ul className="flex h-[58px] items-stretch">
        {TAB_ITEMS.map((item) => {
          const badge = badges[item.key];

          return (
            <li key={item.key} className="flex-1">
              <NavLink
                to={item.to}
                onClick={selection}
                className="flex h-full flex-col items-center justify-center gap-1"
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <item.icon
                        size={20}
                        aria-hidden
                        className={cn(
                          'transition-colors duration-200',
                          isActive ? 'text-brand' : 'text-faint',
                        )}
                      />
                      {badge > 0 && (
                        <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-info px-1 text-[10px] font-bold text-white">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </span>

                    <span
                      className={cn(
                        'text-[10px] font-semibold tracking-tight transition-colors duration-200',
                        isActive ? 'text-brand' : 'text-faint',
                      )}
                    >
                      {item.label}
                    </span>

                    {isActive && (
                      <motion.span
                        layoutId="tab-underline"
                        aria-hidden
                        className="absolute bottom-1 h-[3px] w-7 rounded-full bg-brand"
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
