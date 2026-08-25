import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { Switch } from '@/components/ui/Switch';
import { ConfirmDialog } from '@/components/ui/Modal';
import { APP_VERSION, ROUTES } from '@/constants';
import { useSettingsStore } from '@/store/settings.store';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { requestPushPermission } from '@/services/native.service';
import { cn } from '@/utils/cn';
import type { Language, ThemeMode } from '@/types';
import { ChangeMobileModal } from './ChangeMobileModal';

const THEMES: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ்' },
  { value: 'hi', label: 'हिन्दी' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-faint">
        {title}
      </h2>
      <div className="card-base divide-y divide-line">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-content">{label}</p>
        {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings, hydrate, update } = useSettingsStore();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);
  const signOut = useAuthStore((state) => state.signOut);
  const pushToast = useUiStore((state) => state.pushToast);

  const [changingMobile, setChangingMobile] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPushPermission();
      if (!granted) {
        pushToast('Enable notifications for this app in your device settings.', 'error');
        return;
      }
    }
    await update({ pushEnabled: enabled });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    queryClient.clear();
    setLoggingOut(false);
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <>
      <PageLayout title="Settings" showBack>
        <Section title="Appearance">
          <div className="px-4 py-4">
            <p className="mb-3 text-[13px] font-bold text-content">Theme</p>
            <div
              role="radiogroup"
              aria-label="Theme"
              className="flex rounded-2xl bg-surface-alt p-1"
            >
              {THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  role="radio"
                  aria-checked={themeMode === theme.value}
                  onClick={() => setThemeMode(theme.value)}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-colors',
                    themeMode === theme.value
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted hover:text-content',
                  )}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-4">
            <label
              htmlFor="language"
              className="mb-2 block text-[13px] font-bold text-content"
            >
              Language
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(event) => void update({ language: event.target.value as Language })}
              className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[13px] font-semibold text-content outline-none ring-1 ring-line focus:ring-2 focus:ring-brand"
            >
              {LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Notifications">
          <ToggleRow
            label="Push notifications"
            description="New indents, trip updates and payments"
            checked={settings.pushEnabled}
            onChange={(value) => void handlePushToggle(value)}
          />
          <ToggleRow
            label="Trip alerts"
            description="Status changes on your active trips"
            checked={settings.tripAlerts}
            onChange={(value) => void update({ tripAlerts: value })}
          />
          <ToggleRow
            label="Payment alerts"
            description="Advances and balance settlements"
            checked={settings.paymentAlerts}
            onChange={(value) => void update({ paymentAlerts: value })}
          />
        </Section>

        <Section title="Security">
          <ToggleRow
            label="Biometric unlock"
            description="Use Face ID or fingerprint to open the app"
            checked={settings.biometricEnabled}
            onChange={(value) => void update({ biometricEnabled: value })}
          />
          <button
            type="button"
            onClick={() => setChangingMobile(true)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-alt"
          >
            <span className="flex-1 text-[13px] font-bold text-content">
              Change mobile number
            </span>
            <FiChevronRight size={19} aria-hidden className="shrink-0 text-faint" />
          </button>
        </Section>

        <Section title="About">
          <a
            href="https://tripleatransport.in/privacy"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-surface-alt"
          >
            <span className="flex-1 text-[13px] font-bold text-content">Privacy Policy</span>
            <FiExternalLink size={18} aria-hidden className="shrink-0 text-faint" />
          </a>
          <a
            href="https://tripleatransport.in/terms"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-surface-alt"
          >
            <span className="flex-1 text-[13px] font-bold text-content">Terms of Service</span>
            <FiExternalLink size={18} aria-hidden className="shrink-0 text-faint" />
          </a>
          <button
            type="button"
            onClick={() => navigate(ROUTES.help)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-alt"
          >
            <span className="flex-1 text-[13px] font-bold text-content">Help &amp; Support</span>
            <FiChevronRight size={19} aria-hidden className="shrink-0 text-faint" />
          </button>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-[13px] font-bold text-content">App version</span>
            <span className="tnum text-[12px] font-semibold text-muted">{APP_VERSION}</span>
          </div>
        </Section>

        <button
          type="button"
          onClick={() => setConfirmingLogout(true)}
          className="pressable w-full rounded-card bg-brand-50 py-4 text-[13px] font-extrabold text-brand transition-colors hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/30"
        >
          Log Out
        </button>
      </PageLayout>

      <ChangeMobileModal open={changingMobile} onClose={() => setChangingMobile(false)} />

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
