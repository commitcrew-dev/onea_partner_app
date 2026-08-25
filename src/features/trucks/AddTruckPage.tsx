import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppButton } from '@/components/ui/AppButton';
import { queryKeys } from '@/api/queryClient';
import { CITIES, VEHICLE_TYPES } from '@/constants';
import { useHaptics } from '@/hooks/useHaptics';
import { truckService } from '@/services/truck.service';
import { useUiStore } from '@/store/ui.store';
import { newTruckSchema, type NewTruckForm, type NewTruckValues } from '@/utils/validation';
import { cn } from '@/utils/cn';
import type { ApiFailure, NewTruckInput } from '@/types';

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
}

function Field({ label, error, children, htmlFor }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-faint"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT_CLASS =
  'h-[54px] w-full rounded-2xl bg-card px-4 text-[13px] font-semibold text-content outline-none ring-1 transition-colors placeholder:font-medium placeholder:text-faint';

/** Add a vehicle to the fleet. Validated live with React Hook Form + Zod. */
export function AddTruckPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const { success, error: errorHaptic } = useHaptics();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NewTruckForm>({
    resolver: zodResolver(newTruckSchema),
    mode: 'onChange',
    defaultValues: {
      registrationNumber: '',
      vehicleType: '',
      capacityTon: '',
      city: '',
      driverName: '',
      driverMobile: '',
    },
  });

  const create = useMutation({
    mutationFn: (input: NewTruckInput) => truckService.create(input),
    onSuccess: (truck) => {
      success();
      pushToast(`${truck.registrationNumber} added to your fleet.`, 'success');
      void queryClient.invalidateQueries({ queryKey: queryKeys.trucks.all });
      navigate(`/trucks/${truck.id}`, { replace: true });
    },
    onError: (error: ApiFailure) => {
      errorHaptic();
      pushToast(error.message ?? 'Could not add this truck.', 'error');
    },
  });

  // The resolver has already validated these, so `parse` only applies the
  // transforms (trimming, and capacity from string to number).
  const onSubmit = handleSubmit((values) => {
    const parsed: NewTruckValues = newTruckSchema.parse(values);
    create.mutate(parsed as NewTruckInput);
  });

  return (
    <PageLayout
      title="Add Truck"
      showBack
      footer={
        <AppButton
          size="lg"
          fullWidth
          disabled={!isValid}
          loading={create.isPending}
          onClick={() => void onSubmit()}
        >
          Add Truck
        </AppButton>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field
          label="Registration number"
          htmlFor="registrationNumber"
          error={errors.registrationNumber?.message}
        >
          <input
            id="registrationNumber"
            {...register('registrationNumber')}
            placeholder="TN-09-CD-1290"
            autoCapitalize="characters"
            autoComplete="off"
            className={cn(
              INPUT_CLASS,
              'tnum uppercase',
              errors.registrationNumber ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
        </Field>

        <Field label="Vehicle type" htmlFor="vehicleType" error={errors.vehicleType?.message}>
          <select
            id="vehicleType"
            {...register('vehicleType')}
            className={cn(
              INPUT_CLASS,
              errors.vehicleType ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          >
            <option value="">Select a type</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Capacity (tons)" htmlFor="capacityTon" error={errors.capacityTon?.message}>
          <input
            id="capacityTon"
            {...register('capacityTon')}
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            placeholder="20"
            className={cn(
              INPUT_CLASS,
              'tnum',
              errors.capacityTon ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
        </Field>

        <Field label="Base city" htmlFor="city" error={errors.city?.message}>
          <input
            id="city"
            {...register('city')}
            list="city-options"
            placeholder="Salem"
            autoComplete="address-level2"
            className={cn(
              INPUT_CLASS,
              errors.city ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
          <datalist id="city-options">
            {CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </Field>

        <Field label="Driver name" htmlFor="driverName" error={errors.driverName?.message}>
          <input
            id="driverName"
            {...register('driverName')}
            placeholder="Murugan R"
            autoComplete="name"
            className={cn(
              INPUT_CLASS,
              errors.driverName ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
        </Field>

        <Field label="Driver mobile" htmlFor="driverMobile" error={errors.driverMobile?.message}>
          <input
            id="driverMobile"
            {...register('driverMobile')}
            type="tel"
            inputMode="numeric"
            placeholder="9043228316"
            autoComplete="tel-national"
            className={cn(
              INPUT_CLASS,
              'tnum',
              errors.driverMobile ? 'ring-2 ring-danger' : 'ring-line focus:ring-2 focus:ring-brand',
            )}
          />
        </Field>

        <p className="text-[12px] leading-relaxed text-muted">
          Vehicle documents start as pending. Upload the RC book, insurance, permit and fitness
          certificate to make this truck eligible for indents.
        </p>
      </form>
    </PageLayout>
  );
}
