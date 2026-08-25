import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { AppButton } from '@/components/ui/AppButton';
import { CITIES } from '@/constants';
import { useHaptics } from '@/hooks/useHaptics';
import { profileService, type ProfileUpdate } from '@/services/profile.service';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { profileSchema, type ProfileForm } from '@/utils/validation';
import { cn } from '@/utils/cn';
import type { ApiFailure, Partner } from '@/types';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  partner: Partner;
}

const INPUT_CLASS =
  'h-[52px] w-full rounded-2xl bg-surface px-4 text-[13px] font-semibold text-content outline-none ring-1 transition-colors';

export function EditProfileModal({ open, onClose, partner }: EditProfileModalProps) {
  const setPartner = useAuthStore((state) => state.setPartner);
  const pushToast = useUiStore((state) => state.pushToast);
  const { success, error: errorHaptic } = useHaptics();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    values: { name: partner.name, company: partner.company, city: partner.city },
  });

  const update = useMutation({
    mutationFn: (patch: ProfileUpdate) => profileService.update(patch),
    onSuccess: (updated) => {
      success();
      setPartner(updated);
      pushToast('Profile updated.', 'success');
      onClose();
    },
    onError: (error: ApiFailure) => {
      errorHaptic();
      pushToast(error.message ?? 'Could not save your changes.', 'error');
    },
  });

  const onSubmit = handleSubmit((values) => update.mutate(values));

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit profile"
      footer={
        <div className="flex gap-3">
          <AppButton variant="secondary" fullWidth onClick={handleClose}>
            Cancel
          </AppButton>
          <AppButton
            fullWidth
            disabled={!isValid || !isDirty}
            loading={update.isPending}
            onClick={() => void onSubmit()}
          >
            Save
          </AppButton>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="profile-name"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-faint"
          >
            Name
          </label>
          <input
            id="profile-name"
            {...register('name')}
            autoComplete="name"
            className={cn(
              INPUT_CLASS,
              errors.name ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
          {errors.name && (
            <p role="alert" className="mt-1.5 text-[12px] font-semibold text-danger">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-company"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-faint"
          >
            Company
          </label>
          <input
            id="profile-company"
            {...register('company')}
            autoComplete="organization"
            className={cn(
              INPUT_CLASS,
              errors.company ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
          {errors.company && (
            <p role="alert" className="mt-1.5 text-[12px] font-semibold text-danger">
              {errors.company.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-city"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-faint"
          >
            City
          </label>
          <input
            id="profile-city"
            {...register('city')}
            list="profile-city-options"
            autoComplete="address-level2"
            className={cn(
              INPUT_CLASS,
              errors.city ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
          <datalist id="profile-city-options">
            {CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          {errors.city && (
            <p role="alert" className="mt-1.5 text-[12px] font-semibold text-danger">
              {errors.city.message}
            </p>
          )}
        </div>

        <p className="text-[12px] leading-relaxed text-muted">
          To change your registered mobile number, go to Settings → Change mobile number.
        </p>
      </form>
    </Modal>
  );
}
