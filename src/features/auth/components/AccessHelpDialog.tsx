import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import type { LoginTranslations } from '@/lib/constants/translations'

interface AccessHelpDialogProps {
  t: LoginTranslations
}

/**
 * AccessHelpDialog component per Section 10.2
 * Displays an accessible informational modal when "Access denied" is clicked.
 */
export const AccessHelpDialog: React.FC<AccessHelpDialogProps> = ({ t }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-[32px] items-center rounded-[6px] border border-slate-300 bg-white/80 px-2.5 text-[12px] font-medium text-slate-700 shadow-none transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          {t.accessDeniedButton}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white p-6 sm:rounded-lg">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft-mint text-brand-deep-teal">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {t.accessDeniedTitle}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t.accessDeniedMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Support Contact</p>
          <p className="mt-0.5">Email: support@rida.tz | Hotline: +255 22 211 0000</p>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="brand" size="sm" className="w-full sm:w-auto">
              {t.closeButton}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
