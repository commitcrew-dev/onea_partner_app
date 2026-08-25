import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { FiLogOut, FiX } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';
import { APP_VERSION } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { formatMobile } from '@/utils/format';
import { cn } from '@/utils/cn';
import { DRAWER_ITEMS, TAB_ITEMS } from './navItems';
import { useTabBadges } from './useTabBadges';

interface DrawerProps {
  onLogout: () => void;
}

/** Slide-in menu for tablet and mobile, reachable from the Profile screen. */
export function Drawer({ onLogout }: DrawerProps) {
  const open = useUiStore((state) => state.drawerOpen);
  const setOpen = useUiStore((state) => state.setDrawerOpen);
  const partner = useAuthStore((state) => state.partner);
  const badges = useTabBadges();

  const items = [
    ...TAB_ITEMS.map((item) => ({ ...item, badge: badges[item.key] })),
    ...DRAWER_ITEMS.map((item) => ({
      ...item,
      key: item.to,
      badge: item.to.includes('notifications') ? badges.notifications : 0,
    })),
  ];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <motion.nav
            aria-label="Menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="relative flex h-full w-[290px] max-w-[82vw] flex-col bg-card pt-safe"
          >
            <div className="bg-brand px-5 pb-5 pt-6 text-white">
              <div className="flex items-start justify-between">
                {partner && (
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={partner.initials}
                      name={partner.name}
                      size="md"
                      className="bg-white/20"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-extrabold">{partner.name}</p>
                      <p className="truncate text-[11px] text-white/80">
                        {formatMobile(partner.mobile)}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="pressable -mr-1 rounded-full p-1.5 text-white/85 hover:bg-white/15"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto p-3">
              {items.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3.5 rounded-2xl px-3.5 py-3.5 transition-colors',
                        isActive
                          ? 'bg-brand-100 text-brand dark:bg-brand-900/25'
                          : 'text-content hover:bg-surface-alt',
                      )
                    }
                  >
                    <item.icon size={21} aria-hidden className="shrink-0" />
                    <span className="flex-1 text-[12px] font-bold">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="flex h-[21px] min-w-[21px] items-center justify-center rounded-full bg-info px-1.5 text-[11px] font-bold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="border-t border-line p-3 pb-safe">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3.5 text-danger transition-colors hover:bg-danger/10"
              >
                <FiLogOut size={21} aria-hidden />
                <span className="text-[12px] font-bold">Log Out</span>
              </button>
              <p className="px-3.5 pb-2 pt-3 text-[11px] text-faint">Version {APP_VERSION}</p>
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
