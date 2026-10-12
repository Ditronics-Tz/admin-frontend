import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { QueryError } from '@/components/feedback/QueryError'
import { promoService } from '../promo.service'
import type { AudienceInput, AudienceResult, Passenger } from '../types'
import { parseAudienceText } from '../utils'
import { usePromoText } from '../i18n'
import { usePromoWriteAccess } from '../access'
import { Empty, Pagination, PromoSkeleton } from './shared'
import { useDebounced } from '../hooks'

export function AudienceReport({ result }: { result: AudienceResult }) {
  const t = usePromoText()
  return (
    <div role="status" className="space-y-2 rounded-lg border bg-slate-50 p-3 text-sm">
      <p>
        {t('Added: {count}', { count: result.added })} ·{' '}
        {t('Already present: {count}', { count: result.already_present })}
      </p>
      {result.not_found.length > 0 && (
        <p>
          {t('Not found')}: {result.not_found.join(', ')}
        </p>
      )}
      {result.not_passengers.length > 0 && (
        <p>
          {t('Not passengers')}: {result.not_passengers.join(', ')}
        </p>
      )}
    </div>
  )
}
export function AudiencePicker({
  initial = [],
  initialText = '',
  onClose,
  onApply,
  pending = false,
  error,
}: {
  initial?: Passenger[]
  initialText?: string
  onClose: () => void
  onApply: (input: AudienceInput, users: Passenger[], text: string) => void
  pending?: boolean
  error?: unknown
}) {
  const t = usePromoText(),
    canWrite = usePromoWriteAccess()
  const [search, setSearch] = useState(''),
    [offset, setOffset] = useState(0),
    [text, setText] = useState(initialText)
  const [selected, setSelected] = useState<Record<string, Passenger>>(() =>
    Object.fromEntries(initial.map((u) => [u.id, u]))
  )
  const [fileError, setFileError] = useState('')
  const debounced = useDebounced(search)
  const users = useQuery({
    queryKey: ['promotions', 'passenger-search', debounced, offset],
    queryFn: () => promoService.passengers(debounced, 20, offset),
  })
  const parsed = parseAudienceText(text)
  const total = Object.keys(selected).length + parsed.phones.length + parsed.emails.length
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent
        className="max-h-[90dvh] max-w-2xl overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (pending) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (pending) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('Choose passengers')}</DialogTitle>
          <DialogDescription>
            {t(
              'Choose accounts or paste phone numbers and email addresses. The server checks each recipient when saved.'
            )}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="search">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="search">{t('Search passengers')}</TabsTrigger>
            <TabsTrigger value="paste">{t('Paste phones or emails')}</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="space-y-3">
            <Label htmlFor="picker-search">{t('Search passengers')}</Label>
            <Input
              id="picker-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setOffset(0)
              }}
              placeholder={t('Name, email or phone')}
            />
            {users.isPending ? (
              <PromoSkeleton />
            ) : users.isError ? (
              <QueryError error={users.error} retry={() => void users.refetch()} />
            ) : (
              <>
                <div className="max-h-52 overflow-y-auto">
                  {users.data.users.length === 0 ? (
                    <Empty message="No passengers found" />
                  ) : (
                    users.data.users.map((u) => (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center gap-3 border-b p-3"
                      >
                        <input
                          type="checkbox"
                          checked={!!selected[u.id]}
                          disabled={!canWrite || pending}
                          onChange={(e) =>
                            setSelected((old) => {
                              const next = { ...old }
                              if (e.target.checked) next[u.id] = u
                              else delete next[u.id]
                              return next
                            })
                          }
                        />
                        <span>
                          {u.name}
                          <span className="block text-xs text-muted-foreground">
                            {u.phone || u.email}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <Pagination
                  total={users.data.total}
                  offset={offset}
                  onChange={setOffset}
                />
              </>
            )}
          </TabsContent>
          <TabsContent value="paste" className="space-y-3">
            <Label htmlFor="audience-paste">
              {t('Phone numbers or email addresses')}
            </Label>
            <Textarea
              id="audience-paste"
              rows={5}
              value={text}
              disabled={pending || !canWrite}
              onChange={(e) => setText(e.target.value)}
              placeholder={'+255712345678\npassenger@example.com'}
            />
            <Label htmlFor="audience-file">{t('Upload CSV')}</Label>
            <Input
              id="audience-file"
              type="file"
              accept=".csv,text/csv,text/plain"
              disabled={pending || !canWrite}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 1_000_000) {
                  setFileError(t('Choose a CSV smaller than 1 MB.'))
                  return
                }
                setFileError('')
                void file
                  .text()
                  .then(setText)
                  .catch(() => setFileError(t('Unable to read this file.')))
              }}
            />
            {fileError && (
              <p role="alert" className="text-destructive">
                {fileError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t(
                'Separate values with commas or new lines. CSV phone and email headers are supported.'
              )}
            </p>
          </TabsContent>
        </Tabs>
        <section className="space-y-2">
          <h3 className="font-semibold">{t('Selected ({count})', { count: total })}</h3>
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {Object.values(selected).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {u.name} — {u.phone || u.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canWrite || pending}
                  aria-label={t('Remove {name}', { name: u.name })}
                  onClick={() =>
                    setSelected((old) => {
                      const next = { ...old }
                      delete next[u.id]
                      return next
                    })
                  }
                >
                  {t('Remove')}
                </Button>
              </li>
            ))}
            {[...parsed.phones, ...parsed.emails].map((value) => (
              <li key={value} className="flex items-center justify-between gap-2 text-sm">
                <span>{value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canWrite || pending}
                  onClick={() =>
                    setText(
                      [...parsed.phones, ...parsed.emails]
                        .filter((v) => v !== value)
                        .join('\n')
                    )
                  }
                >
                  {t('Remove')}
                </Button>
              </li>
            ))}
          </ul>
        </section>
        {!!error && <QueryError error={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={pending} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={!canWrite || pending || total > 500}
            onClick={() =>
              onApply(
                { ...parsed, user_ids: Object.keys(selected) },
                Object.values(selected),
                text
              )
            }
          >
            {t(pending ? 'Saving…' : 'Apply selection')}
          </Button>
        </div>
        {total > 500 && <p role="alert">{t('Add at most 500 identifiers at a time.')}</p>}
      </DialogContent>
    </Dialog>
  )
}
