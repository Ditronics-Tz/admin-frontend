import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Driver } from '../types/driver.types'
import type { BackendDriverDocument, BackendVerificationDetail } from '@/lib/api/types'
import { verificationService } from '../services/verification.service'
import { LicencePreview } from './LicencePreview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/feedback/QueryError'
import { usePermission } from '@/features/auth/hooks/usePermission'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  getDocumentTypeLabel,
  getVerificationStatusLabel,
} from '../utils/driver-formatters'
import { formatDateTime } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ReasonDialog'

export function VerificationReviewPanel({ driver }: { driver: Driver }) {
  const { canVerifyDrivers, isAdmin } = usePermission()
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['verification', driver.id],
    queryFn: () => verificationService.get(driver.id),
    refetchInterval: 15000,
  })
  const [suspendDialog, setSuspendDialog] = useState(false)
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (action: () => Promise<BackendVerificationDetail>) => action(),
    onSuccess: async (detail) => {
      queryClient.setQueryData(['verification', driver.id], detail)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drivers'] }),
        queryClient.invalidateQueries({ queryKey: ['driver', driver.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] }),
      ])
      setSuspendDialog(false)
      setNote('')
      toast.success('Verification updated.')
    },
  })
  if (query.isPending) return <p role="status">Loading verification…</p>
  if (query.isError)
    return <QueryError error={query.error} retry={() => void query.refetch()} />
  const detail = query.data
  const owned = detail.profile.assigned_to === user?.id
  const canReview =
    canVerifyDrivers && owned && detail.profile.verification_status === 'under_review'
  const suspended = detail.user?.status === 'suspended'
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">{driver.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              {driver.email} · {driver.vehicle.plateNumber}
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
            {getVerificationStatusLabel(detail.profile.verification_status)}
          </span>
        </div>
        <p className="text-sm">
          {detail.profile.assigned_to
            ? owned
              ? 'You have claimed this review.'
              : `Claimed by reviewer ${detail.profile.assigned_to}.`
            : 'No reviewer assigned.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            Refresh
          </Button>
          {canVerifyDrivers && (
            <>
              <Button
                disabled={
                  mutation.isPending ||
                  detail.profile.verification_status !== 'submitted' ||
                  !!detail.profile.assigned_to
                }
                onClick={() =>
                  mutation.mutate(() => verificationService.claim(driver.id))
                }
              >
                Claim review
              </Button>
              {detail.profile.assigned_to && (owned || isAdmin) && (
                <Button
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate(() => verificationService.release(driver.id))
                  }
                >
                  Release claim
                </Button>
              )}
              {canReview && (
                <Button
                  disabled={
                    mutation.isPending ||
                    detail.documents.some((doc) => doc.status !== 'approved') ||
                    detail.required_types.some(
                      (type) => !detail.documents.some((doc) => doc.type === type)
                    )
                  }
                  onClick={() =>
                    mutation.mutate(() => verificationService.approve(driver.id))
                  }
                >
                  Final approval
                </Button>
              )}
              <Button
                variant={suspended ? 'outline' : 'destructive'}
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.reset()
                  setSuspendDialog(true)
                }}
              >
                {suspended ? 'Lift suspension' : 'Suspend driver'}
              </Button>
            </>
          )}
        </div>
        {mutation.isError && <QueryError error={mutation.error} />}
        <p className="text-xs text-muted-foreground">
          All required documents must be approved and unexpired before the driver can go
          online. A replacement preserves the earlier file and its review history.
        </p>
      </section>
      {!!detail.duplicate_flags?.length && (
        <section
          role="alert"
          className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-5"
        >
          <h3 className="font-semibold">Duplicate identity submissions</h3>
          {detail.duplicate_flags.map((flag) => (
            <p key={flag.id} className="break-all text-sm">
              {flag.field.replaceAll('_', ' ')}: {flag.value} — submitted by{' '}
              {flag.driver_id}; matches account {flag.matched_driver_id}. Recorded{' '}
              {formatDateTime(flag.created_at)}.
            </p>
          ))}
          <p className="text-xs">
            These records show blocked duplicate attempts. Confirm ownership before
            continuing the review.
          </p>
        </section>
      )}
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Required documents</h3>
        <p className="text-xs text-muted-foreground">
          Insurance upload is optional in Rida. Valid motor insurance remains a legal
          requirement for road use.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detail.required_types.map((kind) => {
            const doc = detail.documents.find((item) => item.type === kind)
            return (
              <div key={kind} className="rounded-lg border p-4">
                <p className="font-medium">{getDocumentTypeLabel(kind)}</p>
                <p className="mt-1 text-sm capitalize">
                  {doc?.status.replaceAll('_', ' ') || 'Missing'}
                </p>
                {doc && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Uploaded {formatDateTime(doc.created_at)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        {detail.documents.map((document) => (
          <DocumentReview
            key={document.id}
            document={document}
            canReview={canReview}
            canOverride={
              canVerifyDrivers &&
              isAdmin &&
              ['approved', 'rejected'].includes(document.status)
            }
            busy={mutation.isPending}
            codes={detail.rejection_codes}
            preview={() => setPreview(document.id)}
            onDecision={(decision, code, text) =>
              mutation.mutate(() =>
                verificationService.review(driver.id, document.id, decision, code, text)
              )
            }
          />
        ))}
      </div>
      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Permanent review history</h3>
        {detail.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decisions yet.</p>
        ) : (
          <ol className="divide-y">
            {detail.reviews.map((review) => (
              <li key={review.id} className="space-y-2 py-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="capitalize">
                    {review.decision.replaceAll('_', ' ')}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(review.created_at)}
                  </span>
                </div>
                <p>
                  {review.reviewer_name ||
                    (['uploaded', 'submitted', 'identifiers_changed'].includes(
                      review.decision
                    )
                      ? driver.fullName
                      : 'System')}
                  {review.reviewer_id && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {review.reviewer_id}
                    </span>
                  )}
                </p>
                {review.reason_code && (
                  <p className="capitalize text-rose-700">
                    {review.reason_code.replaceAll('_', ' ')}
                  </p>
                )}
                {review.note && <p className="whitespace-pre-wrap">{review.note}</p>}
                {review.document_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreview(review.document_id)}
                  >
                    Open reviewed file version
                  </Button>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verification document</DialogTitle>
            <DialogDescription>
              Private file accessible to the owner and staff.
            </DialogDescription>
          </DialogHeader>
          {preview && <LicencePreview documentId={preview} />}
        </DialogContent>
      </Dialog>
      <Dialog
        open={suspendDialog}
        onOpenChange={(open) => {
          if (!mutation.isPending) setSuspendDialog(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspended ? 'Lift suspension?' : 'Suspend driver?'}
            </DialogTitle>
            <DialogDescription>
              {suspended
                ? 'The account can sign in again. Existing document decisions remain in force.'
                : 'The account will be blocked immediately. The reason remains in its suspension history.'}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              mutation.mutate(() =>
                verificationService.suspend(driver.id, !suspended, note)
              )
            }}
          >
            <label className="block space-y-2 text-sm">
              Reason
              <textarea
                required
                maxLength={2000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 w-full rounded border p-3"
              />
            </label>
            {mutation.isError && <QueryError error={mutation.error} />}
            <Button disabled={mutation.isPending || !note.trim()} type="submit">
              Confirm
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentReview({
  document,
  canReview,
  canOverride,
  busy,
  codes,
  preview,
  onDecision,
}: {
  document: BackendDriverDocument
  canReview: boolean
  canOverride: boolean
  busy: boolean
  codes: string[]
  preview: () => void
  onDecision: (decision: 'approved' | 'rejected', code: string, note: string) => void
}) {
  const [decision, setDecision] = useState<'approved' | 'rejected'>(
    document.status === 'approved' ? 'rejected' : 'approved'
  )
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')
  const [confirm, setConfirm] = useState(false)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (decision === 'rejected' || canOverride) setConfirm(true)
    else onDecision(decision, '', note.trim())
  }
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{getDocumentTypeLabel(document.type)}</h3>
          <p className="mt-1 text-sm capitalize">{document.status}</p>
        </div>
        <Button size="sm" variant="outline" onClick={preview}>
          Preview / download
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Expiry:{' '}
        {document.expires_at
          ? `${formatDateTime(document.expires_at)} (EAT)`
          : 'Not specified'}
      </p>
      {document.reviewed_at && (
        <p className="text-xs text-muted-foreground">
          Reviewed {formatDateTime(document.reviewed_at)} by {document.reviewed_by}
        </p>
      )}
      {document.rejection_note && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {document.rejection_code.replaceAll('_', ' ')}: {document.rejection_note}
        </p>
      )}
      {(document.status === 'submitted' || canOverride) &&
        (canReview || canOverride ? (
          <form onSubmit={submit} className="space-y-3 border-t pt-4">
            <label className="block space-y-2 text-sm">
              Decision
              <select
                value={decision}
                onChange={(event) =>
                  setDecision(event.target.value as 'approved' | 'rejected')
                }
                className="block w-full rounded border p-2"
                disabled={busy}
              >
                <option value="approved">Approve document</option>
                <option value="rejected">Reject and request re-upload</option>
              </select>
            </label>
            {decision === 'rejected' && (
              <label className="block space-y-2 text-sm">
                Reason code
                <select
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="block w-full rounded border p-2"
                  disabled={busy}
                >
                  <option value="">Choose a reason</option>
                  {codes.map((value) => (
                    <option key={value} value={value}>
                      {value.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block space-y-2 text-sm">
              {decision === 'rejected'
                ? 'Rejection note (required)'
                : canOverride
                  ? 'Override reason (required)'
                  : 'Reviewer note (optional)'}
              <textarea
                required={decision === 'rejected' || canOverride}
                maxLength={2000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={busy}
                className="min-h-20 w-full rounded border p-3"
              />
            </label>
            <Button
              type="submit"
              disabled={
                busy ||
                (canOverride && !note.trim()) ||
                (decision === 'rejected' && (!code || !note.trim()))
              }
            >
              {busy ? 'Saving…' : 'Record decision'}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            Claim this review to record a decision.
          </p>
        ))}
      {confirm && (
        <ConfirmDialog
          title="Confirm document decision?"
          description="The required reason is retained in the review history. A rejected document requires a replacement upload; notification delivery is not confirmed by this action."
          pending={busy}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            onDecision(decision, decision === 'rejected' ? code : '', note.trim())
            setConfirm(false)
          }}
        />
      )}
    </section>
  )
}
