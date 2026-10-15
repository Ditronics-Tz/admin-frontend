import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { formatApiError } from '@/lib/api/errors'
import { Button } from '@/components/ui/button'
import { QueryError } from '@/components/feedback/QueryError'
import { useShipText } from './ship-text'
import { maskPhone } from './mask-phone'

export function MaskedValue({ value, userId }: { value: string; userId: string }) {
  const t = useShipText(),
    [revealed, setRevealed] = useState<string | null>(null)
  const reveal = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<{ phone: string }>(
          `/admin/users/${encodeURIComponent(userId)}/reveal-phone`
        )
      ).data,
    onSuccess: (data) => setRevealed(data.phone),
  })
  const unavailable =
    reveal.isError && [404, 501].includes(formatApiError(reveal.error).status || 0)
  if (!value) return <span>{t('Not added to profile')}</span>
  return (
    <span>
      {revealed || maskPhone(value)}{' '}
      <Button
        size="sm"
        variant="ghost"
        disabled={reveal.isPending || unavailable}
        onClick={() => (revealed ? setRevealed(null) : reveal.mutate())}
      >
        {t(revealed ? 'Hide' : 'Reveal')}
      </Button>
      {unavailable ? (
        <span role="status">{t('Reveal unavailable')}</span>
      ) : (
        reveal.isError && <QueryError error={reveal.error} />
      )}
    </span>
  )
}
