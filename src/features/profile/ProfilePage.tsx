import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiBell,
  FiChevronRight,
  FiCreditCard,
  FiLogOut,
  FiMoon,
  FiPhone,
  FiUser,
} from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Switch } from '@/components/ui/Switch';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { formatMobile } from '@/utils/format';
import type { ReactNode } from 'react';

/**
 * Icon-row menu item — the primary layout unit on this page. Partners cannot
 * edit their own profile from here (edit is admin-only), so rows without an
 * onClick render as plain read-only cards.
 */
function MenuRow({
  icon,
  label,
  description,
  onClick,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  const Wrapper: 'button' | 'div' = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3.5 border-b border-line/70 px-4 py-3.5 text-left transition-colors last:border-b-0 ${
        onClick ? 'hover:bg-surface-alt' : ''
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-content">{label}</p>
        {description && (
          <p className="mt-0.5 truncate text-[11px] text-muted">{description}</p>
        )}
      </div>
      {trailing ?? (onClick && <FiChevronRight size={16} className="shrink-0 text-faint" />)}
    </Wrapper>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const partner = useAuthStore((state) => state.partner);
  const signOut = useAuthStore((state) => state.signOut);
  const resolved = useThemeStore((state) => state.resolved);
  const toggleTheme = useThemeStore((state) => state.toggle);

  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    queryClient.clear();
    setLoggingOut(false);
    navigate(ROUTES.login, { replace: true });
  };

  if (!partner) return null;

  return (
    <>
      <PageLayout padded={false}>
        <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-6">
          {/* Header card — read-only profile identity */}
          <div className="relative overflow-hidden rounded-hero bg-brand-hero p-5 text-white shadow-lg shadow-brand/25">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/12 blur-2xl"
            />
            <div className="relative flex items-center gap-4">
              <Avatar
                initials={partner.initials}
                name={partner.name}
                size="lg"
                className="ring-2 ring-white/40"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[17px] font-bold leading-tight tracking-tight text-white">
                  {partner.name}
                </h1>
                <p className="mt-1 truncate text-[12px] text-white/85">
                  {formatMobile(partner.mobile)}
                </p>
                {partner.company && (
                  <p className="mt-0.5 truncate text-[11px] text-white/70">{partner.company}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account — all read-only */}
          <section className="mt-5">
            <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-faint">
              Account
            </h2>
            <div className="overflow-hidden rounded-2xl border border-line/70 bg-card">
              <MenuRow
                icon={<FiUser size={16} />}
                label={partner.name}
                description={partner.company || 'Partner'}
              />
              <MenuRow
                icon={<FiPhone size={16} />}
                label="Mobile"
                description={formatMobile(partner.mobile)}
              />
              <MenuRow
                icon={<FiCreditCard size={16} />}
                label="Bank details"
                description={`${partner.bank.bank} · ${partner.bank.accountNumberMasked}`}
              />
            </div>
            <p className="mt-2 px-1 text-[10px] text-faint">
              Contact your ops team to update these details.
            </p>
          </section>

          {/* Preferences */}
          <section className="mt-5">
            <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-faint">
              Preferences
            </h2>
            <div className="overflow-hidden rounded-2xl border border-line/70 bg-card">
              <MenuRow
                icon={<FiMoon size={16} />}
                label="Dark mode"
                description={resolved === 'dark' ? 'On' : 'Off'}
                trailing={
                  <Switch checked={resolved === 'dark'} onChange={toggleTheme} label="Dark mode" />
                }
              />
              <MenuRow
                icon={<FiBell size={16} />}
                label="Notifications"
                description="Load alerts, trip updates"
                onClick={() => navigate(ROUTES.notifications)}
              />
            </div>
          </section>

          {/* Logout */}
          <motion.button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            whileTap={{ scale: 0.98 }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 py-3.5 text-[13px] font-bold text-danger transition-colors hover:bg-danger/15"
          >
            <FiLogOut size={16} />
            Log out
          </motion.button>

          <p className="mt-4 text-center text-[10px] text-faint">
            TripleA Transport · Partner
          </p>
        </div>
      </PageLayout>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need your mobile number and an OTP to sign back in."
        confirmLabel="Log Out"
        tone="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </>
  );
}
