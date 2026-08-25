import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiFileText, FiTrendingUp, FiTruck } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { AppButton } from '@/components/ui/AppButton';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { storage } from '@/services/storage.service';
import { cn } from '@/utils/cn';

interface Slide {
  icon: IconType;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: FiFileText,
    title: 'Loads that suit your fleet',
    body: 'See every open indent on your routes with the rate, weight and vehicle type up front — no phone calls needed.',
  },
  {
    icon: FiTruck,
    title: 'Track every trip live',
    body: 'Follow each consignment from assignment to delivery, and keep your drivers and trucks in one place.',
  },
  {
    icon: FiTrendingUp,
    title: 'Get paid without chasing',
    body: 'Trip rates, TDS and balances are itemised for every load, so you always know what is due and when.',
  },
];

/** Three-slide intro, shown once before the first login. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await storage.set(STORAGE_KEYS.onboardingSeen, true);
    navigate(ROUTES.login, { replace: true });
  };

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="flex h-dvh flex-col bg-surface px-safe pb-safe pt-safe">
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={() => void finish()}
          className="px-2 py-1 text-[12px] font-bold text-muted transition-colors hover:text-content"
        >
          Skip
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[32px] bg-brand-100 text-brand dark:bg-brand-900/30">
              <Icon size={48} aria-hidden />
            </div>

            <h1 className="mt-9 max-w-sm text-[22px] font-extrabold leading-tight tracking-tight text-content">
              {slide.title}
            </h1>
            <p className="mt-3.5 max-w-sm text-[13px] leading-relaxed text-muted">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 pb-8" role="tablist" aria-label="Slides">
        {SLIDES.map((item, dotIndex) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            aria-selected={dotIndex === index}
            aria-label={`Slide ${dotIndex + 1}`}
            onClick={() => setIndex(dotIndex)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              dotIndex === index ? 'w-7 bg-brand' : 'w-2 bg-line',
            )}
          />
        ))}
      </div>

      <div className="px-4 pb-4">
        <AppButton
          size="lg"
          fullWidth
          onClick={() => (isLast ? void finish() : setIndex(index + 1))}
        >
          {isLast ? 'Get Started' : 'Next'}
        </AppButton>
      </div>
    </div>
  );
}
