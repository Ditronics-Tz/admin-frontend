import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DriverDocument } from '../types/driver.types'
import { getDocumentTypeLabel } from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'
import { LicencePreview } from './LicencePreview'

interface DriverDocumentsTabProps {
  documents: DriverDocument[]
  driverId: string
}

export const DriverDocumentsTab: React.FC<DriverDocumentsTabProps> = ({ documents }) => {
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
                <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
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
                      <h4 className="text-xs font-semibold text-[#172B36]">
                        {doc.title || getDocumentTypeLabel(doc.type)}
                      </h4>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        {doc.documentNumber}
                      </p>
                    </div>

                    <div className="space-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
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
                        <div className="mt-2 rounded bg-rose-50 p-2 text-rose-700">
                          <p className="text-[10px] font-semibold">Rejection Reason:</p>
                          <p className="mt-0.5 text-[10px]">{doc.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDoc(doc)}
                    className="mt-auto w-full gap-1.5 border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
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
            <p className="font-mono text-xs text-slate-500">
              Document Ref: {selectedDoc?.documentNumber}
            </p>
          </DialogHeader>

          {selectedDoc && <LicencePreview documentId={selectedDoc.id} />}

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Status: <strong className="capitalize">{selectedDoc?.status}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
