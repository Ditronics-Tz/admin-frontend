import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  useApproveVerification,
  useRejectVerification,
} from '../hooks/useDrivers'
import type { Driver, DriverDocument } from '../types/driver.types'
import {
  formatTzPhone,
  getVehicleTypeLabel,
  getDocumentTypeLabel,
} from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  rejectVerificationSchema,
  type RejectVerificationFormData,
} from '../schemas/verification.schema'

interface VerificationReviewPanelProps {
  driver: Driver
}

export const VerificationReviewPanel: React.FC<VerificationReviewPanelProps> = ({
  driver,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DriverDocument | null>(
    driver.documents[0] || null
  )
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)

  const { mutate: approveVerification, isPending: isApproving } =
    useApproveVerification()
  const { mutate: rejectVerification, isPending: isRejecting } =
    useRejectVerification()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectVerificationFormData>({
    resolver: zodResolver(rejectVerificationSchema),
    defaultValues: {
      reason: 'mismatched_details',
      notes: '',
    },
  })

  const handleApprove = () => {
    approveVerification(driver.id, {
      onSuccess: () => {
        setApproveConfirmOpen(false)
      },
    })
  }

  const handleRejectSubmit = (data: RejectVerificationFormData) => {
    rejectVerification(
      {
        driverId: driver.id,
        reason: data.reason,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          reset()
          setRejectModalOpen(false)
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Status Banner */}
      {driver.verificationStatus === 'approved' && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-emerald-900">
              Driver Verification Approved
            </p>
            <p className="text-emerald-700 mt-0.5">
              All compliance credentials and LATRA safety checks have been validated.
              The driver is cleared for operational trips.
            </p>
          </div>
        </div>
      )}

      {driver.verificationStatus === 'rejected' && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800">
          <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-rose-900">
              Verification Rejected
            </p>
            <p className="text-rose-700 mt-0.5">
              This submission was rejected due to non-compliant documentation. Driver
              must re-upload credentials.
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Review Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Driver Info & Document Checklist (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Driver Profile Summary Card */}
          <Card className="border-slate-200/80 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Driver Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 py-1.5">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-[#172B36]">{driver.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 py-1.5">
                <span className="text-slate-500">Driver Code</span>
                <span className="font-mono font-medium text-slate-700">
                  {driver.driverCode}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 py-1.5">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-700">
                  {formatTzPhone(driver.phone)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 py-1.5">
                <span className="text-slate-500">Assigned Vehicle</span>
                <span className="font-semibold text-[#172B36]">
                  {driver.vehicle.make} {driver.vehicle.model} (
                  {driver.vehicle.plateNumber})
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Vehicle Category</span>
                <span className="font-medium text-slate-700">
                  {getVehicleTypeLabel(driver.vehicle.type)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Document Checklist Selection */}
          <Card className="border-slate-200/80 shadow-none">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Documents ({driver.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {driver.documents.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">
                  No documents attached to this application.
                </p>
              ) : (
                driver.documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full flex items-center justify-between rounded-lg p-3 text-left text-xs transition-all ${
                        isSelected
                          ? 'border border-brand-primary-teal bg-teal-50/60 ring-1 ring-brand-primary-teal/40'
                          : 'border border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected
                              ? 'bg-brand-primary-teal text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#172B36]">
                            {doc.title || getDocumentTypeLabel(doc.type)}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {doc.documentNumber}
                          </p>
                        </div>
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
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Document Viewer & Action Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Document Inspector Card */}
          <Card className="border-slate-200/80 shadow-none overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-[#172B36]">
                  {selectedDoc
                    ? selectedDoc.title || getDocumentTypeLabel(selectedDoc.type)
                    : 'Document Viewer'}
                </CardTitle>
                {selectedDoc && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Doc ID: {selectedDoc.documentNumber}
                  </p>
                )}
              </div>

              {selectedDoc && (
                <Badge
                  variant={
                    selectedDoc.status === 'approved'
                      ? 'success'
                      : selectedDoc.status === 'rejected'
                        ? 'destructive'
                        : 'warning'
                  }
                  className="capitalize text-xs"
                >
                  {selectedDoc.status}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-6">
              {selectedDoc ? (
                <div className="space-y-4">
                  {/* Document Graphic Viewer */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-900/95 p-8 text-white min-h-[300px]">
                    <img
                      src="/brand/rida-logo-transparent.png"
                      alt="Compliance document preview"
                      className="max-h-[180px] object-contain opacity-90"
                    />
                    <div className="mt-4 text-center">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-brand-soft-mint">
                        {selectedDoc.title || getDocumentTypeLabel(selectedDoc.type)}
                      </span>
                      <p className="mt-2 text-xs text-slate-300">
                        Official document registered for Tanzania Regulatory Compliance
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Reference Number: {selectedDoc.documentNumber}
                      </p>
                    </div>
                  </div>

                  {/* Dates & Compliance Metadata */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500">Submission Date:</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {formatDateTime(selectedDoc.submissionDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Expiry Date:</span>
                      <p className="font-semibold text-slate-700 mt-0.5">
                        {selectedDoc.expiryDate
                          ? formatDateTime(selectedDoc.expiryDate)
                          : 'No expiration recorded'}
                      </p>
                    </div>
                  </div>

                  {selectedDoc.rejectionReason && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                      <p className="font-semibold">Rejection Notes:</p>
                      <p className="mt-0.5 text-rose-700">{selectedDoc.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  Select a document from the checklist on the left to inspect details.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Decision Control Bar */}
          <Card className="border-slate-200/80 shadow-none bg-slate-50/50">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Compliance Decision
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized operations reviewers only
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={isRejecting || isApproving}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Reject Verification
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setApproveConfirmOpen(true)}
                    disabled={isRejecting || isApproving}
                    className="bg-brand-primary-teal hover:bg-brand-primary-hover text-white text-xs font-semibold"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Approve Driver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog: Approve Verification */}
      <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg">Approve Driver Verification?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Confirm that you have reviewed the required Tanzania driving license,
              NIDA identity, and vehicle credentials for{' '}
              <strong className="text-slate-700">{driver.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApproveConfirmOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApprove}
              disabled={isApproving}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isApproving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal with Structured Reason and Notes */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg">Reject Driver Verification</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Specify the compliance issue so that{' '}
              <strong className="text-slate-700">{driver.fullName}</strong> can correct
              their submission.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleRejectSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason" className="text-xs font-semibold">
                Rejection Reason <span className="text-rose-500">*</span>
              </Label>
              <select
                id="reject-reason"
                {...register('reason')}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#172B36] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              >
                <option value="mismatched_details">
                  Document Details Do Not Match Profile
                </option>
                <option value="unreadable_document">
                  Unreadable / Blurry Image
                </option>
                <option value="expired_document">Document Has Expired</option>
                <option value="incomplete_submission">
                  Missing Required Document Pages
                </option>
                <option value="invalid_credentials">
                  Invalid LATRA / Driving License Number
                </option>
                <option value="other">Other Regulatory Non-Compliance</option>
              </select>
              {errors.reason && (
                <p className="text-[11px] text-rose-500">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reject-notes" className="text-xs font-semibold">
                Explanatory Note for Driver <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reject-notes"
                {...register('notes')}
                placeholder="Explain clearly what document was rejected and how to re-submit..."
                className="h-24 text-xs"
              />
              {errors.notes && (
                <p className="text-[11px] text-rose-500">{errors.notes.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isRejecting}
                className="gap-1.5 bg-rose-600 hover:bg-rose-700"
              >
                {isRejecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Rejection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
