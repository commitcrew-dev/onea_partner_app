import { z } from 'zod';
import { MOBILE_LENGTH, OTP_LENGTH, VEHICLE_TYPES } from '@/constants';

/** Indian mobile numbers are 10 digits starting 6–9. */
export const mobileSchema = z.object({
  mobile: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .length(MOBILE_LENGTH, `Enter all ${MOBILE_LENGTH} digits`)
        .regex(/^[6-9]/, 'Mobile numbers start with 6, 7, 8 or 9'),
    ),
});

export type MobileForm = z.input<typeof mobileSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code`)
    .regex(/^\d+$/, 'The code is digits only'),
});

export type OtpForm = z.infer<typeof otpSchema>;

/** Matches `TN09CD1290`, `TN-09-CD-1290` and spaced variants. */
const REGISTRATION_PATTERN = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,3}[\s-]?\d{1,4}$/i;

export const newTruckSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration number is required')
    .regex(REGISTRATION_PATTERN, 'Use a format like TN-09-CD-1290'),
  vehicleType: z.enum(VEHICLE_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Select a vehicle type' }),
  }),
  // Kept as a string on the way in so the number field can start empty,
  // then transformed to a number for the service layer.
  capacityTon: z
    .string()
    .trim()
    .min(1, 'Enter the capacity in tons')
    .refine((value) => !Number.isNaN(Number(value)), 'Enter the capacity in tons')
    .transform(Number)
    .pipe(
      z
        .number()
        .min(1, 'Capacity must be at least 1 ton')
        .max(60, 'Capacity looks too high'),
    ),
  city: z.string().trim().min(2, 'Enter the base city'),
  driverName: z.string().trim().min(2, "Enter the driver's name"),
  driverMobile: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(
      z
        .string()
        .length(MOBILE_LENGTH, 'Enter a valid 10-digit mobile')
        .regex(/^[6-9]/, 'Mobile numbers start with 6, 7, 8 or 9'),
    ),
});

/** Raw field values bound to the inputs. */
export type NewTruckForm = z.input<typeof newTruckSchema>;
/** Parsed values handed to the service once validation passes. */
export type NewTruckValues = z.output<typeof newTruckSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60, 'Name is too long'),
  company: z.string().trim().min(2, 'Company name is required').max(80, 'Name is too long'),
  city: z.string().trim().min(2, 'City is required'),
});

export type ProfileForm = z.infer<typeof profileSchema>;
