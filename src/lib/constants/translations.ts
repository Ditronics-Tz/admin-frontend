import type { AppLocale } from '@/types/locale'

export interface LoginTranslations {
  brandSubtitle: string
  locationEyebrow: string
  welcomeHeadline: string
  welcomeSubtitle: string
  authEyebrow: string
  authTitle: string
  authSubtitle: string
  emailLabel: string
  emailPlaceholder: string
  emailRequired: string
  emailInvalid: string
  passwordLabel: string
  passwordPlaceholder: string
  passwordRequired: string
  passwordShow: string
  passwordHide: string
  submitButton: string
  submittingButton: string
  demoNotice: string
  accessDeniedButton: string
  accessDeniedTitle: string
  accessDeniedMessage: string
  closeButton: string
  backendOfflineMessage: string
}

export const LOGIN_TRANSLATIONS: Record<AppLocale, LoginTranslations> = {
  en: {
    brandSubtitle: 'Operations console',
    locationEyebrow: 'DAR ES SALAAM · TANZANIA',
    welcomeHeadline: 'Good to have you back.',
    welcomeSubtitle: 'Sign in to keep Dar moving.',
    authEyebrow: 'AUTHORIZED RIDA STAFF ONLY',
    authTitle: 'Sign in',
    authSubtitle: 'Sign in to keep Dar moving.',
    emailLabel: 'Work email',
    emailPlaceholder: 'name@rida.tz',
    emailRequired: 'Work email is required',
    emailInvalid: 'Please enter a valid work email address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    passwordRequired: 'Password is required',
    passwordShow: 'Show password',
    passwordHide: 'Hide password',
    submitButton: 'Sign in',
    submittingButton: 'Signing in...',
    demoNotice: 'Demo preview: authentication is not yet connected.',
    accessDeniedButton: 'Access denied',
    accessDeniedTitle: 'Administrative Access Policy',
    accessDeniedMessage:
      'Only authorized Rida staff can access this console. If you believe you should have access, contact your system administrator.',
    closeButton: 'Understood',
    backendOfflineMessage:
      'Authentication service is not configured yet. Backend connection is currently offline.',
  },
  sw: {
    brandSubtitle: 'Dashibodi ya uendeshaji',
    locationEyebrow: 'DAR ES SALAAM · TANZANIA',
    welcomeHeadline: 'Karibu tena kazini.',
    welcomeSubtitle: 'Ingia ili kuendelea kuendesha Dar.',
    authEyebrow: 'WATUMISHI WA RIDA TU WALIOIDHINISHWA',
    authTitle: 'Ingia',
    authSubtitle: 'Ingia ili kuendelea kuendesha Dar.',
    emailLabel: 'Barua pepe ya kazi',
    emailPlaceholder: 'jina@rida.tz',
    emailRequired: 'Barua pepe ya kazi inahitajika',
    emailInvalid: 'Tafadhali weka barua pepe halali ya kazi',
    passwordLabel: 'Nenosiri',
    passwordPlaceholder: 'Weka nenosiri lako',
    passwordRequired: 'Nenosiri linahitajika',
    passwordShow: 'Onyesha nenosiri',
    passwordHide: 'Ficha nenosiri',
    submitButton: 'Ingia',
    submittingButton: 'Inaingia...',
    demoNotice: 'Hakikisho la jaribio: mfumo wa uthibitishaji bado haujaunganishwa.',
    accessDeniedButton: 'Huna idhini',
    accessDeniedTitle: 'Sera ya Ufikiaji wa Utawala',
    accessDeniedMessage:
      'Watumishi wa Rida walioidhinishwa pekee ndio wanaoweza kufikia dashibodi hii. Ikiwa unaamini unapaswa kuwa na idhini, wasiliana na msimamizi wa mfumo.',
    closeButton: 'Nimeelewa',
    backendOfflineMessage:
      'Huduma ya uthibitishaji bado haijasanidiwa. Muunganisho wa seva haupatikani kwa sasa.',
  },
}
