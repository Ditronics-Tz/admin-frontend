import { format, parseISO } from 'date-fns'

/**
 * Format a numeric amount to Tanzanian Shillings (TZS).
 * E.g., 25000 -> "TZS 25,000"
 */
export function formatTZS(amount: number, options?: { showCode?: boolean }): string {
  const { showCode = true } = options ?? {}
  const formatted = new Intl.NumberFormat('en-TZ', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount)

  return showCode ? `TZS ${formatted}` : formatted
}

/**
 * Format a number according to locale standard.
 */
export function formatNumber(value: number, locale = 'en-TZ'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format a date/time string or Date instance in the Africa/Dar_es_Salaam context.
 */
export function formatDateTime(
  dateInput: Date | string | number,
  formatPattern = 'dd MMM yyyy, HH:mm'
): string {
  try {
    const dateObj =
      typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput)

    return format(dateObj, formatPattern)
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format relative or short date for Tanzanian administrative tables.
 */
export function formatDateOnly(
  dateInput: Date | string | number,
  formatPattern = 'dd/MM/yyyy'
): string {
  try {
    const dateObj =
      typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput)

    return format(dateObj, formatPattern)
  } catch {
    return 'Invalid date'
  }
}
