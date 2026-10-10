export type AppLocale = 'en' | 'sw'

export interface LocaleConfig {
  code: AppLocale
  label: string
  dateFormat: string
  timeFormat: string
}
