import { z } from 'zod'

/**
 * Tanzanian phone number validation regex
 * Matches +255 6XX XXX XXX, +255 7XX XXX XXX, 06XXXXXXXX, or 07XXXXXXXX
 */
const tzPhoneRegex = /^(?:\+255|0)[67]\d{8}$/

export const driverFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  phone: z
    .string()
    .trim()
    .refine((val) => tzPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid Tanzania phone (+255 7XX XXX XXX or 07XXXXXXXX)',
    }),
  city: z.string().trim().min(2, 'City is required'),
  district: z.string().trim().optional(),
  vehicleType: z.enum(['motorcycle', 'bajaji', 'car'], {
    message: 'Please select a valid vehicle type',
  }),
  vehicleMake: z
    .string()
    .trim()
    .min(2, 'Manufacturer/Make is required')
    .max(50, 'Make cannot exceed 50 characters'),
  vehicleModel: z
    .string()
    .trim()
    .min(2, 'Model is required')
    .max(50, 'Model cannot exceed 50 characters'),
  vehicleYear: z
    .number({ message: 'Year must be a number' })
    .int('Year must be an integer')
    .min(2000, 'Vehicle year must be 2000 or newer')
    .max(new Date().getFullYear() + 1, 'Invalid vehicle year'),
  vehiclePlateNumber: z
    .string()
    .trim()
    .min(4, 'Registration plate is required')
    .max(15, 'Registration plate too long'),
  vehicleColor: z
    .string()
    .trim()
    .min(2, 'Vehicle color is required')
    .max(30, 'Color too long'),
})

export type DriverFormData = z.infer<typeof driverFormSchema>

export const suspendDriverSchema = z.object({
  reason: z.enum(
    [
      'policy_violation',
      'verification_issue',
      'customer_complaints',
      'administrative_review',
      'other',
    ],
    {
      message: 'Please choose a suspension reason',
    }
  ),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
})

export type SuspendDriverFormData = z.infer<typeof suspendDriverSchema>
