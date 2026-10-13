import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import { QueryError } from '@/components/feedback/QueryError'

export function LicencePreview({
  driverId,
  documentId,
}: {
  driverId?: string
  documentId?: string
}) {
  const path = documentId
    ? `/files/documents/${documentId}`
    : API_ENDPOINTS.FILES.LICENCE_DOC(driverId || '')
  return <LicenceDocument key={path} path={path} />
}

function LicenceDocument({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [mime, setMime] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | null = null
    void apiClient
      .get<Blob>(path, {
        responseType: 'blob',
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (controller.signal.aborted) return
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(data.type.split(';')[0]))
          throw new Error('The server returned an unsupported document format.')
        objectUrl = URL.createObjectURL(data)
        setUrl(objectUrl)
        setMime(data.type)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path, attempt])
  if (error != null)
    return (
      <QueryError
        error={error}
        retry={() => {
          setError(null)
          setUrl(null)
          setAttempt((value) => value + 1)
        }}
      />
    )
  if (!url)
    return (
      <p role="status" className="p-6 text-sm">
        Loading licence document…
      </p>
    )
  return (
    <div className="space-y-3">
      <img
        src={url}
        alt="Uploaded verification document"
        className="max-h-[60vh] w-full rounded-lg bg-muted object-contain"
      />
      <a
        href={url}
        rel="noopener noreferrer"
        download={`document${mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg'}`}
        className="text-sm text-primary underline"
      >
        Download document
      </a>
    </div>
  )
}
