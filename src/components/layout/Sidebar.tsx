import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiLogOut } from 'react-icons/fi';
import logoMark from '@/assets/logos/mark-512.png';
import { APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { Avatar } from '@/components/ui/Avatar';
import { DRAWER_ITEMS, TAB_ITEMS } from './navItems';
import { useTabBadges } from './useTabBadges';

interface SidebarProps {
  onLogout: () => void;
}

/** Collapsible desktop navigation rail, shown from `lg` upwards. */
export function Sidebar({ onLogout }: SidebarProps) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);
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

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="relative z-40 flex h-full shrink-0 flex-col bg-header text-white"
    >
      <div className="flex h-[76px] items-center gap-3 px-5">
        <img src={logoMark} alt="" width={38} height={38} className="h-[38px] w-[38px] shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate text-[13px] font-extrabold tracking-tight"
          >
            {APP_NAME}
          </motion.span>
        )}
      </div>
      <div className="header-rule" />

      <nav aria-label="Primary" className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {items.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors',
                    isActive ? 'bg-brand text-white' : 'text-white/65 hover:bg-white/10',
                    collapsed && 'justify-center',
                  )
                }
              >
                <span className="relative shrink-0">
                  <item.icon size={21} aria-hidden />
                  {item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-info px-1 text-[10px] font-bold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="truncate text-[12px] font-bold">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        {partner && (
          <div className={cn('mb-2 flex items-center gap-3 px-2 py-2', collapsed && 'justify-center')}>
            <Avatar initials={partner.initials} name={partner.name} size="sm" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold">{partner.name}</p>
                <p className="truncate text-[11px] text-white/55">{partner.company}</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Log Out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-white/65 transition-colors hover:bg-danger/20 hover:text-danger',
            collapsed && 'justify-center',
          )}
        >
          <FiLogOut size={20} aria-hidden />
          {!collapsed && <span className="text-[12px] font-bold">Log Out</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-[86px] flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-md transition-transform hover:scale-110"
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} className="flex">
          <FiChevronLeft size={16} />
        </motion.span>
      </button>
    </motion.aside>
  );
}
