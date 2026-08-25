import { FiExternalLink } from 'react-icons/fi';
import logoMark from '@/assets/logos/mark-512.png';
import { PageLayout } from '@/components/layout/PageLayout';
import { DataGroup, DataRow } from '@/components/ui/DataRow';
import { APP_NAME, APP_VERSION } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { formatLongDate } from '@/utils/format';

export function AboutPage() {
  const partner = useAuthStore((state) => state.partner);

  return (
    <PageLayout title="About" showBack>
      <div className="flex flex-col items-center py-6 text-center">
        <img
          src={logoMark}
          alt=""
          width={92}
          height={92}
          className="h-[92px] w-[92px] object-contain"
        />
        <h1 className="mt-4 text-[15px] font-extrabold tracking-tight text-content">
          {APP_NAME}
        </h1>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.25em] text-brand">
          Partner
        </p>
        <p className="tnum mt-2 text-[12px] text-faint">Version {APP_VERSION}</p>
      </div>

      <p className="mb-6 text-[12px] leading-relaxed text-muted">
        TripleA Transport connects verified fleet partners with full-truckload movements across
        South India. This app gives you direct access to open indents, live trip tracking and
        transparent, itemised payments — without a single phone call.
      </p>

      {partner && (
        <DataGroup title="Your account" className="mb-6">
          <DataRow label="Partner code" value={partner.code} />
          <DataRow label="Company" value={partner.company} />
          <DataRow label="Base city" value={partner.city} />
          <DataRow label="Member since" value={formatLongDate(partner.memberSince)} />
          <DataRow label="Rating" value={`${partner.rating.toFixed(1)} / 5.0`} />
        </DataGroup>
      )}

      <DataGroup title="Company">
        <DataRow label="Registered name" value="TripleA Transport Pvt Ltd" />
        <DataRow label="Head office" value="Chennai, Tamil Nadu" />
        <a
          href="https://tripleatransport.in"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-alt"
        >
          <span className="flex-1 text-[12px] text-muted">Website</span>
          <span className="text-[12px] font-bold text-content">tripleatransport.in</span>
          <FiExternalLink size={16} aria-hidden className="shrink-0 text-faint" />
        </a>
      </DataGroup>

      <p className="mt-8 text-center text-[11px] text-faint">
        © {new Date().getFullYear()} TripleA Transport Pvt Ltd. All rights reserved.
      </p>
    </PageLayout>
  );
}
