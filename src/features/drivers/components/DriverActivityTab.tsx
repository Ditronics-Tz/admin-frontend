import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

import type { Driver, DriverAuditLog } from '../types/driver.types'
import { formatDateTime } from '@/lib/utils/formatters'

interface DriverActivityTabProps {
  driver: Driver
}

export const DriverActivityTab: React.FC<DriverActivityTabProps> = ({ driver }) => {
  const auditLogs: DriverAuditLog[] = [
    {
      id: 'log-1',
      action: 'Account Registration',
      performedBy: 'Driver Self-Service Portal (Dar es Salaam)',
      timestamp: driver.joinedAt,
      details: `Registered profile with phone ${driver.phone} and vehicle ${driver.vehicle.plateNumber}.`,
    },
    ...(driver.verificationStatus === 'approved'
      ? [
          {
            id: 'log-2',
            action: 'Document Verification Approval',
            performedBy: 'Compliance Officer (LATRA Desk)',
            timestamp: '2025-02-10T11:00:00Z',
            details:
              'Approved Tanzania Driving License and Commercial Vehicle inspection records.',
          },
        ]
      : []),
    ...(driver.accountStatus === 'suspended' && driver.suspendedAt
      ? [
          {
            id: 'log-3',
            action: 'Account Suspended',
            performedBy: 'Operations Supervision Desk',
            timestamp: driver.suspendedAt,
            details: `Enforced operational suspension: ${
              driver.suspensionReason || 'Violation'
            }. Notes: ${driver.suspensionNotes || 'None'}`,
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-[#172B36] mb-4">
            Administrative Audit Trail
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
            {auditLogs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4">
                <div className="absolute -left-6 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary-teal ring-4 ring-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs text-[#172B36]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {formatDateTime(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>

                  <span className="inline-block text-[10px] font-medium text-brand-primary-teal bg-teal-50 px-2 py-0.5 rounded">
                    Actor: {log.performedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
