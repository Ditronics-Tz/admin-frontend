import { useEffect, useState } from 'react'
import { loadDocumentImage } from '../services/document-image'
import { API_ENDPOINTS } from '@/lib/constants'
import { QueryError } from '@/components/feedback/QueryError'
import { Button } from '@/components/ui/button'
import { useShipText } from '@/components/common/ship-text'

export function LicencePreview({
  driverId,
  documentId,
}: {
  driverId?: string
  documentId?: string
}) {
  const path = documentId
    ? `/files/documents/${encodeURIComponent(documentId)}`
    : API_ENDPOINTS.FILES.LICENCE_DOC(driverId || '')
  return <LicenceDocument key={path} path={path} documentId={documentId} />
}

function LicenceDocument({ path, documentId }: { path: string; documentId?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [mime, setMime] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)
  const [zoom, setZoom] = useState(1),
    [rotation, setRotation] = useState(0)
  const t = useShipText()
  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | null = null
    let expiryTimer: ReturnType<typeof setTimeout> | undefined
    void loadDocumentImage(path, controller.signal, documentId)
      .then(({ blob, expiresAt }) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setMime(blob.type)
        expiryTimer = setTimeout(
          () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
            setUrl(null)
            setError(new Error('Document link expired. Reload to obtain a new link.'))
          },
          Math.max(1, expiresAt - Date.now())
        )
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => {
      controller.abort()
      if (expiryTimer) clearTimeout(expiryTimer)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path, attempt, documentId])
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
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          aria-label={t('Zoom in')}
          onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
        >
          {t('Zoom in')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          aria-label={t('Zoom out')}
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
        >
          {t('Zoom out')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRotation((value) => (value + 90) % 360)}
        >
          {t('Rotate')}
        </Button>
      </div>
      <div className="max-h-[60vh] overflow-auto rounded-lg bg-muted p-4">
        <img
          src={url}
          alt="Uploaded verification document"
          className="max-h-[60vh] w-full rounded-lg bg-muted object-contain"
          style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
          onError={() =>
            setError(new Error(t('Unable to display document image. Reload the link.')))
          }
        />
      </div>
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
