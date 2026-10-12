import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, FileCheck2, Edit, UserX, UserCheck } from 'lucide-react'
import type { Driver } from '../types/driver.types'
import { SuspendDriverDialog } from './SuspendDriverDialog'
import { ReactivateDriverDialog } from './ReactivateDriverDialog'

interface DriverRowActionsProps {
  driver: Driver
}

export const DriverRowActions: React.FC<DriverRowActionsProps> = ({ driver }) => {
  const navigate = useNavigate()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
            aria-label={`Actions for driver ${driver.fullName}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 text-xs">
          <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400">
            Driver Actions
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigate(`/drivers/${driver.id}`)}
            className="cursor-pointer gap-2 py-2"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>View Full Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/drivers/verifications/${driver.id}`)}
            className="cursor-pointer gap-2 py-2"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Review Documents</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/drivers/${driver.id}/edit`)}
            disabled
            className="cursor-pointer gap-2 py-2"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Driver Info</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {driver.accountStatus === 'suspended' ? (
            <DropdownMenuItem
              onClick={() => setReactivateOpen(true)}
              className="cursor-pointer gap-2 py-2 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Reactivate Account</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setSuspendOpen(true)}
              className="cursor-pointer gap-2 py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <UserX className="h-3.5 w-3.5 text-rose-500" />
              <span>Suspend Driver</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SuspendDriverDialog
        driver={driver}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
      />

      <ReactivateDriverDialog
        driver={driver}
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
      />
    </>
  )
}
