import { z } from 'zod'

export const rejectVerificationSchema = z.object({
  reason: z.enum(
    [
      'unreadable_document',
      'expired_document',
      'mismatched_details',
      'incomplete_submission',
      'invalid_credentials',
      'other',
    ],
    {
      message: 'Please select a reason for rejection',
    }
  ),
  notes: z
    .string()
    .trim()
    .min(5, 'Please provide an explanatory note for the rejection (min 5 characters)')
    .max(500, 'Explanatory note cannot exceed 500 characters'),
})

export type RejectVerificationFormData = z.infer<typeof rejectVerificationSchema>
