import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notification.service'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { useShipText } from '@/components/common/ship-text'

export function AnnouncementForm() {
  const t = useShipText()
  const cache = useQueryClient()
  const [audience, setAudience] = useState<'both' | 'passengers' | 'drivers'>('both')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [key, setKey] = useState(() => crypto.randomUUID())
  const [review, setReview] = useState(false)
  const [result, setResult] = useState<{ count: number; push: string } | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      notificationService.announce(
        { audience, title: title.trim(), body: body.trim() },
        key
      ),
    onSuccess: (data) => {
      setResult({ count: data.notified_count, push: data.push_mode })
      setTitle('')
      setBody('')
      setReview(false)
      setKey(crypto.randomUUID())
      void cache.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
  const edit = () => {
    setKey(crypto.randomUUID())
    setResult(null)
    mutation.reset()
  }
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="font-semibold">{t('Send an announcement')}</h2>
      <p className="text-sm text-muted-foreground">
        {t(
          'Send a message to active passengers, drivers, or both. Push alerts require notifications to be allowed on the phone.'
        )}
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          setReview(true)
        }}
      >
        <fieldset disabled={mutation.isPending || review} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            {t('Audience')}
            <select
              className="rounded border p-2"
              value={audience}
              onChange={(event) => {
                setAudience(event.target.value as typeof audience)
                edit()
              }}
            >
              <option value="both">{t('Passengers and drivers')}</option>
              <option value="passengers">{t('Passengers')}</option>
              <option value="drivers">{t('Drivers')}</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            {t('Title')}
            <input
              required
              maxLength={160}
              className="rounded border p-2"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                edit()
              }}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t('Message')}
            <textarea
              required
              maxLength={500}
              rows={3}
              className="rounded border p-2"
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                edit()
              }}
            />
          </label>
        </fieldset>
        {!review && (
          <Button type="submit" disabled={!title.trim() || !body.trim()}>
            {t('Review announcement')}
          </Button>
        )}
      </form>
      {review && (
        <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
          <p className="text-sm font-medium">
            {t('Send this announcement to the selected audience?')}
          </p>
          <p className="font-semibold">{title.trim()}</p>
          <p className="whitespace-pre-wrap text-sm">{body.trim()}</p>
          <div className="flex gap-2">
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? t('Sending…') : t('Send announcement')}
            </Button>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setReview(false)}
            >
              {t('Edit')}
            </Button>
          </div>
        </div>
      )}
      {mutation.isError && <QueryError error={mutation.error} />}
      {result && (
        <p role="status" className="text-sm">
          {t('Accounts notified:')} {result.count}.{' '}
          {result.push === 'fcm'
            ? t('Push alerts queued for registered devices. Delivery is not guaranteed.')
            : t('Push delivery is disabled on the server. Messages were stored only.')}
        </p>
      )}
    </section>
  )
}
