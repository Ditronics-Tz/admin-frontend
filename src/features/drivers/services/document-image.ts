import { apiClient } from '@/lib/api/client'
import { formatApiError, ApiClientError } from '@/lib/api/errors'

export interface PresignedDocument {
  url: string
  method?: string
  headers?: Record<string, string>
  expires_at: string
  content_type: string
  size?: number
}
function checkImage(blob: Blob) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type.split(';')[0]))
    throw new Error(
      'The server returned an unsupported document format. Image previews support PNG, JPEG and WebP only.'
    )
  return blob
}

export async function loadDocumentImage(
  path: string,
  signal: AbortSignal,
  documentId?: string
) {
  if (documentId) {
    let signed: PresignedDocument | undefined
    try {
      const { data } = await apiClient.get<PresignedDocument>(path, {
        params: { presign: true },
        signal,
      })
      if (typeof data === 'object' && data && typeof data.url === 'string') signed = data
    } catch (error) {
      if (formatApiError(error).status !== 501) throw error
    }
    if (signed) {
      const target = new URL(signed.url)
      if (!(
        target.protocol === 'https:' ||
        (target.protocol === 'http:' &&
          ['localhost', '127.0.0.1'].includes(target.hostname))
      ))
        throw new Error('The server returned an unsafe document URL.')
      const expiresAt = Math.min(Date.now() + 300000, Date.parse(signed.expires_at))
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now())
        throw new ApiClientError('Document link expired. Reload to obtain a new link.', {
          code: 'LINK_EXPIRED',
        })
      // Signed storage requests never receive the staff bearer or browser cookies.
      const response = await fetch(target, {
        signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
      if (!response.ok)
        throw new ApiClientError(
          response.status === 403
            ? 'Document link expired. Reload to obtain a new link.'
            : 'Unable to retrieve the document image.',
          { status: response.status }
        )
      return { blob: checkImage(await response.blob()), expiresAt }
    }
  }
  const { data } = await apiClient.get<Blob>(path, { responseType: 'blob', signal })
  return { blob: checkImage(data), expiresAt: Date.now() + 300000 }
}
