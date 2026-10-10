import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DriverDocument } from '../types/driver.types'
import { getDocumentTypeLabel } from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'

interface DriverDocumentsTabProps {
  documents: DriverDocument[]
}

export const DriverDocumentsTab: React.FC<DriverDocumentsTabProps> = ({
  documents,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DriverDocument | null>(null)

  return (
    <div className="space-y-6">
      {documents.length === 0 ? (
        <Card className="border-slate-200/80 p-12 text-center shadow-none">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[#172B36]">
            No verification documents on file
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            This driver has not submitted official verification files yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            return (
              <Card
                key={doc.id}
                className="border-slate-200/80 bg-white transition-all hover:border-slate-300"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-primary-teal">
                        <FileText className="h-4 w-4" />
                      </div>
                      <Badge
                        variant={
                          doc.status === 'approved'
                            ? 'success'
                            : doc.status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                        }
                        className="text-[10px] capitalize"
                      >
                        {doc.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-[#172B36]">
                        {doc.title || getDocumentTypeLabel(doc.type)}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                        {doc.documentNumber}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span className="font-medium text-slate-700">
                          {formatDateTime(doc.submissionDate)}
                        </span>
                      </div>
                      {doc.expiryDate && (
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="font-medium text-slate-700">
                            {formatDateTime(doc.expiryDate)}
                          </span>
                        </div>
                      )}
                      {doc.rejectionReason && (
                        <div className="rounded bg-rose-50 p-2 text-rose-700 mt-2">
                          <p className="font-semibold text-[10px]">Rejection Reason:</p>
                          <p className="text-[10px] mt-0.5">{doc.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDoc(doc)}
                    className="w-full gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 mt-auto"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview Document</span>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Safe Document Preview Dialog */}
      <Dialog
        open={Boolean(selectedDoc)}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {selectedDoc?.title ||
                (selectedDoc?.type
                  ? getDocumentTypeLabel(selectedDoc.type)
                  : 'Document Preview')}
            </DialogTitle>
            <p className="text-xs text-slate-500 font-mono">
              Document Ref: {selectedDoc?.documentNumber}
            </p>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-900/95 p-6 text-white min-h-[340px]">
            <img
              src="/brand/rida-logo-transparent.png"
              alt="Document Preview"
              className="max-h-[220px] object-contain opacity-90"
            />
            <div className="mt-4 text-center">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-brand-soft-mint">
                Authorized Compliance Inspection View
              </span>
              <p className="mt-2 text-[11px] text-slate-400">
                Encrypted Tanzanian regulatory record. Access strictly audited for staff.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Status: <strong className="capitalize">{selectedDoc?.status}</strong></span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDoc(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
