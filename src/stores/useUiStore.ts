import { create } from 'zustand'
import type { AppLocale } from '@/types/locale'

export type ThemePreference = 'light' | 'dark' | 'system'

interface UiState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  themePreference: ThemePreference
  locale: AppLocale
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
  setThemePreference: (theme: ThemePreference) => void
  setLocale: (locale: AppLocale) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  themePreference: 'light',
  locale: 'en',

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  setThemePreference: (themePreference) => set({ themePreference }),
  setLocale: (locale) => set({ locale }),
}))
