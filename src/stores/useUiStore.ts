import { create } from 'zustand'
import type { AppLocale } from '@/types/locale'

export type ThemePreference = 'light' | 'dark' | 'system'

interface UiState {
  sidebarOpen: boolean
  themePreference: ThemePreference
  locale: AppLocale
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setThemePreference: (theme: ThemePreference) => void
  setLocale: (locale: AppLocale) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  themePreference: 'light',
  locale: 'en',

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setThemePreference: (themePreference) => set({ themePreference }),
  setLocale: (locale) => set({ locale }),
}))
