import { useState } from 'react';
import { FiChevronDown, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppButton } from '@/components/ui/AppButton';
import { SUPPORT_PHONE } from '@/constants';
import { cn } from '@/utils/cn';

const FAQS = [
  {
    question: 'How do I get more indents on my routes?',
    answer:
      'Keep your trucks marked as “Waiting For Load” and make sure every vehicle document is verified. Our ops team matches verified trucks to loads on your base city first.',
  },
  {
    question: 'When is the balance paid after delivery?',
    answer:
      'Once the consignee confirms delivery and the POD is uploaded, the balance is released to your registered bank account within 3 working days. TDS at 1% is deducted on the trip rate.',
  },
  {
    question: 'Why is my truck not eligible for indents?',
    answer:
      'A truck becomes ineligible when any document has expired — most often the fitness certificate or insurance. Open the truck from the Trucks tab to see which document needs renewing.',
  },
  {
    question: 'Can I change the driver on an active trip?',
    answer:
      'Yes. Call your ops contact from the trip screen and they will reassign the driver. The trip reference and payment terms stay the same.',
  },
  {
    question: 'How do I update my bank or GPay details?',
    answer:
      'Bank details are changed by our finance team for security. Call support and they will verify your identity before updating the account on file.',
  },
];

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageLayout title="Help & Support" showBack>
      <h1 className="text-[16px] font-extrabold leading-tight tracking-tight text-content">
        How can we help?
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Our partner desk is open 8 AM – 9 PM, seven days a week.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AppButton
          variant="call"
          size="lg"
          leftIcon={<FiPhone size={18} aria-hidden />}
          onClick={() => {
            window.location.href = `tel:${SUPPORT_PHONE}`;
          }}
        >
          Call Support
        </AppButton>
        <AppButton
          variant="secondary"
          size="lg"
          leftIcon={<FiMessageCircle size={18} aria-hidden />}
          onClick={() => {
            window.location.href = `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`;
          }}
        >
          WhatsApp
        </AppButton>
      </div>

      <a
        href="mailto:partners@tripleatransport.in"
        className="mt-3 flex items-center gap-3 rounded-card bg-card p-4 ring-1 ring-line transition-colors hover:bg-surface-alt"
      >
        <FiMail size={20} aria-hidden className="shrink-0 text-muted" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-content">partners@tripleatransport.in</p>
          <p className="text-[12px] text-muted">We reply within one working day</p>
        </div>
      </a>

      <h2 className="mb-3 mt-8 px-1 text-[11px] font-bold uppercase tracking-wide text-faint">
        Frequently asked
      </h2>

      <ul className="space-y-3">
        {FAQS.map((faq, index) => {
          const expanded = openIndex === index;

          return (
            <li key={faq.question} className="card-base overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(expanded ? null : index)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex-1 text-[13px] font-bold leading-snug text-content">
                  {faq.question}
                </span>
                <FiChevronDown
                  size={20}
                  aria-hidden
                  className={cn(
                    'shrink-0 text-faint transition-transform duration-200',
                    expanded && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-[12px] leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </PageLayout>
  );
}
