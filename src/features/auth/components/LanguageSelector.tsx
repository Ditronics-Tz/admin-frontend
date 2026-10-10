import React, { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useUiStore } from '@/stores/useUiStore'
import type { AppLocale } from '@/types/locale'
import { cn } from '@/lib/utils'

interface LanguageOption {
  code: AppLocale
  shortLabel: string
  fullLabel: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', shortLabel: 'EN', fullLabel: 'English' },
  { code: 'sw', shortLabel: 'SW', fullLabel: 'Kiswahili' },
]

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useUiStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOption = LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on Escape
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleSelect = (code: AppLocale) => {
    setLocale(code)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language, currently ${currentOption.fullLabel}`}
        className={cn(
          'inline-flex h-[32px] items-center gap-1.5 rounded-[6px] border border-slate-300 bg-white/80 px-2.5 text-[12px] font-medium text-slate-700 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          isOpen && 'border-primary ring-1 ring-primary'
        )}
      >
        <Globe className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        <span className="font-semibold">{currentOption.shortLabel}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-slate-400 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="Language options"
          className="absolute bottom-full right-0 z-50 mb-1.5 w-36 overflow-hidden rounded-[6px] border border-slate-200 bg-white py-1 shadow-md animate-in fade-in-50 zoom-in-95"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(lang.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelect(lang.code)
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-3 py-1.5 text-[12px] text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:text-primary',
                  isSelected && 'font-semibold text-primary'
                )}
              >
                <span>{lang.fullLabel}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
