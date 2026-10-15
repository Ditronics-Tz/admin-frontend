import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function AuthenticatorQr({ value }: { value: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { margin: 1, width: 220, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setSrc('')
      })
    return () => {
      cancelled = true
    }
  }, [value])
  if (!src) return null
  return (
    <div className="mx-auto w-fit rounded-xl bg-white p-4 shadow-sm">
      <img src={src} alt="Authenticator setup QR code" width={220} height={220} />
    </div>
  )
}
