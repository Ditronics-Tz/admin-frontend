import { z } from 'zod'

/**
 * Creates dynamic Zod validation schema for administrator login form
 * with localized error messaging support.
 */
export const createLoginSchema = (messages?: {
  emailRequired?: string
  emailInvalid?: string
  passwordRequired?: string
}) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, messages?.emailRequired || 'Work email is required')
      .email(messages?.emailInvalid || 'Please enter a valid work email address'),
    password: z
      .string()
      .min(1, messages?.passwordRequired || 'Password is required')
      .refine(
        (val) => val.trim().length > 0,
        messages?.passwordRequired || 'Password is required'
      ),
    rememberMe: z.boolean(),
  })

export const loginSchema = createLoginSchema()

export type LoginFormValues = z.infer<typeof loginSchema>
